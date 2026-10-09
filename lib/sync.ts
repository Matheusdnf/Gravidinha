// Sincronização entre o SQLite local (lib/db.ts) e o Supabase.
// Push: envia as linhas com pendente = 1. Pull: traz o que mudou no servidor desde a última vez.
// Nunca lança erro: sem internet as linhas continuam pendentes e vão na próxima tentativa.
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from './supabase';
import { db, TABELAS, Tabela, paraRemoto, salvarLocal, lerMeta, gravarMeta } from './db';
import { deveAplicar } from './syncRegras';

// Erros em que o servidor recusa a linha por regra (não adianta reenviar)
const MOTIVOS: Record<string, string> = {
  '23505': 'já existe uma gestação ativa',
  '42501': 'a gestação já foi finalizada',
  '23503': 'a gestação não existe mais',
  '23514': 'dados inválidos',
};

const ROTULOS: Record<Tabela['nome'], string> = {
  usuario: 'o perfil',
  gestacao: 'a gestação',
  filho: 'os dados do bebê',
  diario: 'um registro do diário',
  consulta: 'uma consulta',
};

const PAGINA = 1000;

const ouvintesAtualizar = new Set<() => void>();
const ouvintesAviso = new Set<(avisos: string[]) => void>();

export function aoAtualizar(cb: () => void): () => void {
  ouvintesAtualizar.add(cb);
  return () => { ouvintesAtualizar.delete(cb); };
}

export function aoAvisar(cb: (avisos: string[]) => void): () => void {
  ouvintesAviso.add(cb);
  return () => { ouvintesAviso.delete(cb); };
}

// Tela aberta recarrega quando a sincronização traz dados novos
export function useDadosAtualizados(recarregar: () => void) {
  const ref = useRef(recarregar);
  ref.current = recarregar;
  useEffect(() => aoAtualizar(() => ref.current()), []);
}

let emAndamento: Promise<void> | null = null;
let deNovo = false;

// Um ciclo por vez; pedido durante um ciclo roda outro logo depois (pega a gravação que chegou no meio)
export function sincronizar(): Promise<void> {
  if (emAndamento) {
    deNovo = true;
    return emAndamento;
  }
  emAndamento = (async () => {
    do {
      deNovo = false;
      await ciclo().catch((e) => console.error('Falha na sincronização', e));
    } while (deNovo);
  })().finally(() => {
    emAndamento = null;
  });
  return emAndamento;
}

// Chamado por lib/dados.ts após cada gravação local
export function marcarAlterado() {
  sincronizar();
}

async function ciclo() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const avisos: string[] = [];
  const enviou = await push(avisos);
  let mudou = avisos.length > 0; // rejeição trocou a linha local pela do servidor
  if (enviou) mudou = (await pull()) || mudou;

  if (mudou) ouvintesAtualizar.forEach((cb) => cb());
  if (avisos.length) ouvintesAviso.forEach((cb) => cb(avisos));
}

// ponytail: 1–2 requisições por linha pendente; suficiente para o volume de uma usuária. Agrupar em lote se crescer.
// update primeiro e insert se não existir: upsert passaria pela regra de insert do RLS (barraria editar
// consulta de gestação finalizada) e usuario não tem permissão de insert.
async function push(avisos: string[]): Promise<boolean> {
  for (const t of TABELAS) {
    const linhas = await db.getAllAsync<Record<string, any>>(`SELECT * FROM ${t.nome} WHERE pendente = 1`);
    for (const linha of linhas) {
      const id = linha[t.pk];
      const dados = paraRemoto(t, linha);
      let { data, error } = await supabase.from(t.nome).update(dados).eq(t.pk, id).select(t.pk);
      if (!error && data?.length === 0) ({ error } = await supabase.from(t.nome).insert(dados));

      if (error) {
        const motivo = MOTIVOS[error.code];
        if (!motivo) {
          // Sem internet, sessão expirada etc.: tenta tudo de novo depois
          console.error(error);
          return false;
        }
        avisos.push(`${ROTULOS[t.nome]} (${motivo})`);
        await descartarLocal(t, id);
        continue;
      }

      // Só limpa se a linha não foi editada de novo enquanto era enviada
      await db.runAsync(
        `UPDATE ${t.nome} SET pendente = 0 WHERE ${t.pk} = ? AND updated_at IS ?`,
        id,
        linha.updated_at,
      );
    }
  }
  return true;
}

// O servidor venceu: fica a versão dele (ou some, se ele não tem a linha)
async function descartarLocal(t: Tabela, id: string) {
  const { data, error } = await supabase.from(t.nome).select('*').eq(t.pk, id).maybeSingle();
  if (error) return console.error(error);
  if (data) await salvarLocal(t, data, 0);
  else await db.runAsync(`DELETE FROM ${t.nome} WHERE ${t.pk} = ?`, id);
}

// ponytail: cursor por updated_at pode perder uma linha cuja transação commitou depois com now() anterior;
// aceitável para uma usuária com poucos aparelhos. Se aparecer, puxar com margem (ultimo_pull - 1 min).
async function pull(): Promise<boolean> {
  let mudou = false;
  for (const t of TABELAS) {
    const chave = `ultimo_pull:${t.nome}`;
    let cursor = lerMeta(chave);
    for (;;) {
      let q = supabase.from(t.nome).select('*').order('updated_at').limit(PAGINA);
      if (cursor) q = q.gt('updated_at', cursor);
      const { data, error } = await q;
      if (error) throw error;

      for (const remota of data) {
        const local = await db.getFirstAsync<{ pendente: number }>(
          `SELECT pendente FROM ${t.nome} WHERE ${t.pk} = ?`,
          remota[t.pk],
        );
        if (deveAplicar(local)) {
          await salvarLocal(t, remota, 0);
          mudou = true;
        }
      }
      if (data.length > 0) {
        cursor = data[data.length - 1].updated_at as string;
        gravarMeta(chave, cursor);
      }
      if (data.length < PAGINA) break;
    }
  }
  return mudou;
}

export function contarPendentes(): number {
  return TABELAS.reduce(
    (soma, t) => soma + (db.getFirstSync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${t.nome} WHERE pendente = 1`)?.n ?? 0),
    0,
  );
}

// Logout ou troca de conta: nada da usuária anterior fica no aparelho
export async function limparBancoLocal() {
  await emAndamento;
  for (const t of TABELAS) await db.runAsync(`DELETE FROM ${t.nome}`);
  await db.runAsync('DELETE FROM meta');
}

// Login (ou abertura do app já logada): garante que o banco local é desta usuária e puxa os dados
export async function prepararBancoLocal(id_user: string) {
  const dono = lerMeta('id_user');
  if (dono && dono !== id_user) await limparBancoLocal();
  gravarMeta('id_user', id_user);
  await sincronizar();
}

// Ao voltar para o app, tenta sincronizar (no celular; a web não usa o modo offline)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') sincronizar();
  });
}
