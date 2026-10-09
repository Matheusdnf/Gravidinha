// Acesso a dados do app: lê e grava no SQLite local (lib/db.ts), que funciona sem internet.
// Cada gravação marca a linha como pendente e dispara a sincronização com o Supabase (lib/sync.ts).
// Regras checadas aqui antes de gravar, para o erro aparecer na hora mesmo offline: uma gestação
// ativa (o servidor também garante) e não criar diário/consulta em gestação finalizada (só o app
// garante: o registro feito offline antes da finalização precisa ser aceito na sincronização).
// Toda função lança Error com mensagem pronta para exibir em Alert.
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, tabela, salvarLocal, agora, novoId, lerMeta, type Tabela } from './db';
import { prepararBancoLocal, marcarAlterado } from './sync';
import { normalizarHorario } from './syncRegras';
import { calcularSemanaAtual, hojeISO, paraISO } from './gestacao';
import sintDb from '../sint_db.json';
import type { Gestacao, User } from '../types/auth';

// Dona do banco local (gravada no login). Offline com o token vencido o getSession() vem vazio,
// e o app precisa continuar funcionando com os dados locais.
async function meuId(): Promise<string> {
  const dona = lerMeta('id_user');
  if (dona) return dona;
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Sessão expirada. Entre novamente.');
  return data.session.user.id;
}

// Nova linha local, pendente de envio
async function inserir(nome: Tabela['nome'], linha: Record<string, any>) {
  await salvarLocal(tabela(nome), { ...linha, updated_at: agora() }, 1);
}

// Atualiza só os campos informados; devolve quantas linhas mudaram
async function atualizar(nome: Tabela['nome'], id: string, patch: Record<string, any>): Promise<number> {
  const { pk } = tabela(nome);
  const colunas = Object.keys(patch);
  const { changes } = await db.runAsync(
    `UPDATE ${nome} SET ${colunas.map((c) => `${c} = ?`).join(', ')}, updated_at = ?, pendente = 1
     WHERE ${pk} = ? AND deleted_at IS NULL`,
    [...colunas.map((c) => patch[c] ?? null), agora(), id],
  );
  return changes;
}

// Gestação local: booleanos voltam de 0/1 e os filhos vêm junto, como o select do Supabase fazia
async function comFilhos(g: Gestacao): Promise<Gestacao> {
  const filhos = await db.getAllAsync<Record<string, any>>(
    'SELECT * FROM filho WHERE id_gestacao = ? AND deleted_at IS NULL ORDER BY nome',
    g.id_gestacao,
  );
  return {
    ...g,
    primeira_gestacao: g.primeira_gestacao == null ? null : g.primeira_gestacao === 1,
    ainda_nao_decidiu_nome: g.ainda_nao_decidiu_nome == null ? null : g.ainda_nao_decidiu_nome === 1,
    filhos,
  };
}

async function gestacaoAtiva(excetoId?: string) {
  return db.getFirstAsync<{ id_gestacao: string }>(
    "SELECT id_gestacao FROM gestacao WHERE status = 'ativa' AND deleted_at IS NULL AND id_gestacao IS NOT ?",
    excetoId ?? null,
  );
}

async function exigirGestacaoAtiva(id_gestacao: string, mensagem: string) {
  const g = await db.getFirstAsync<{ status: string }>(
    'SELECT status FROM gestacao WHERE id_gestacao = ? AND deleted_at IS NULL',
    id_gestacao,
  );
  if (g?.status === 'finalizada') throw new Error(mensagem);
}

// ---------------------------------------------------------------------------
// Conta
// ---------------------------------------------------------------------------

export async function buscarUsuario(): Promise<User & { profile_image: string | null }> {
  const { data } = await supabase.auth.getSession();
  const u = await db.getFirstAsync<Record<string, any>>('SELECT * FROM usuario WHERE id_user = ?', await meuId());
  if (!u) throw new Error('Erro ao carregar o perfil.');
  // Sessão vencida offline: e-mail do usuário guardado no login
  const email = data.session?.user.email ?? JSON.parse((await AsyncStorage.getItem('gravidinha_user')) ?? '{}').email ?? '';
  return {
    id: u.id_user,
    nome: u.name,
    email,
    celular: String(u.cellphone),
    profile_image: u.profile_image,
  };
}

// Usuário da sessão, sem a foto (o base64 não deve ir para o cache do AsyncStorage)
async function usuarioDaSessao(): Promise<User> {
  const { profile_image, ...user } = await buscarUsuario();
  return user;
}

// Depois do login: traz os dados da usuária para o banco local antes de entrar no app
async function carregarDadosDaConta(id_user: string, mensagem: string): Promise<User> {
  await prepararBancoLocal(id_user);
  try {
    return await usuarioDaSessao();
  } catch {
    throw new Error(mensagem);
  }
}

export async function entrar(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) {
    // Mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails existem
    if (error.code === 'invalid_credentials') throw new Error('E-mail ou senha incorretos');
    if (error.code === 'email_not_confirmed') throw new Error('Confirme seu e-mail antes de entrar.');
    console.error(error);
    throw new Error('Ocorreu um erro ao fazer login.');
  }
  return carregarDadosDaConta(data.user.id, 'Ocorreu um erro ao fazer login.');
}

// dataNascimento em "aaaa-mm-dd". O perfil (tabela usuario) é criado por trigger a partir de options.data.
export async function cadastrar(d: { nome: string; email: string; senha: string; celular: string; dataNascimento: string }) {
  const { data, error } = await supabase.auth.signUp({
    email: d.email.trim().toLowerCase(),
    password: d.senha,
    options: {
      data: { name: d.nome.trim(), cellphone: d.celular.replace(/\D/g, ''), data_nascimento: d.dataNascimento },
    },
  });
  if (error) {
    if (error.code === 'user_already_exists' || error.code === 'email_exists') throw new Error('Este e-mail já está em uso');
    if (error.code === 'weak_password') throw new Error('Senha fraca. Use no mínimo 8 caracteres.');
    console.error(error);
    throw new Error('Erro ao realizar o cadastro do usuário.');
  }
  // Sem sessão = o projeto exige confirmação de e-mail (Auth > Providers > Email > Confirm email)
  if (!data.session) throw new Error('Cadastro criado. Confirme seu e-mail e depois entre no app.');
  return carregarDadosDaConta(data.session.user.id, 'Erro ao realizar o cadastro do usuário.');
}

// Atualização parcial: só altera os campos enviados (a foto vai sozinha, sem reenviar o resto)
export async function atualizarUsuario(d: { nome?: string; celular?: string; profile_image?: string }) {
  const patch: Record<string, unknown> = {};
  if (d.nome !== undefined) {
    if (d.nome.trim() === '') throw new Error('O nome não pode ficar vazio');
    patch.name = d.nome.trim();
  }
  if (d.celular !== undefined) {
    const celular = d.celular.replace(/\D/g, '');
    if (celular.length < 10 || celular.length > 11) throw new Error('Número de celular inválido');
    patch.cellphone = Number(celular);
  }
  if (d.profile_image !== undefined) patch.profile_image = d.profile_image;

  if ((await atualizar('usuario', await meuId(), patch)) === 0) throw new Error('Erro ao atualizar dados.');
  marcarAlterado();
}

// ---------------------------------------------------------------------------
// Gestação
// ---------------------------------------------------------------------------

export async function listarGestacoes() {
  const gestacoes = await db.getAllAsync<Gestacao>(
    'SELECT * FROM gestacao WHERE deleted_at IS NULL ORDER BY data_inicio DESC',
  );
  return Promise.all(gestacoes.map(comFilhos));
}

export async function criarGestacao(d: {
  nomeGestacao?: string;
  semanas: number;
  dpp?: string | null;
  primeiraGestacao: boolean;
  qtdBebes?: string;
  bebes?: { nome?: string; sexo?: string; aindaNaoDecidiuNome?: boolean }[];
}) {
  if (await gestacaoAtiva()) {
    throw new Error('Você já possui uma gestação ativa. Finalize-a antes de criar uma nova.');
  }
  const bebes = d.bebes ?? [];
  const id_gestacao = novoId();
  const id_user = await meuId();

  // Gestação e filhos juntos (ou grava tudo ou nada)
  await db.withTransactionAsync(async () => {
    await inserir('gestacao', {
      id_gestacao,
      id_user,
      nome: d.nomeGestacao?.trim() || 'Minha Gestação',
      data_inicio: hojeISO(),
      primeira_gestacao: d.primeiraGestacao,
      qtd_bebes: d.qtdBebes ?? null,
      semanas: d.semanas,
      dpp: paraISO(d.dpp),
      ainda_nao_decidiu_nome: bebes.some((b) => b.aindaNaoDecidiuNome),
      status: 'ativa',
    });
    for (const [i, b] of bebes.entries()) {
      await inserir('filho', {
        id_filho: novoId(),
        id_gestacao,
        nome: b.aindaNaoDecidiuNome || !b.nome?.trim() ? `Bebê ${i + 1}` : b.nome.trim(),
        sexo: b.sexo || 'nao_informado',
      });
    }
  });
  marcarAlterado();

  // Devolve a gestação completa (semanas, data_inicio, filhos...) para virar a selecionada
  const g = await db.getFirstAsync<Gestacao>('SELECT * FROM gestacao WHERE id_gestacao = ?', id_gestacao);
  return comFilhos(g!);
}

export async function atualizarGestacao(d: {
  id_gestacao: string;
  nome: string;
  semanas: number;
  dpp?: string | null;
  status?: string;
  filhos?: { id_filho?: string; nome?: string; sexo?: string }[];
}) {
  const patch: Record<string, unknown> = { nome: d.nome, semanas: d.semanas, dpp: paraISO(d.dpp) };
  if (d.status) {
    if (d.status === 'ativa' && (await gestacaoAtiva(d.id_gestacao))) throw new Error('Você já possui uma gestação ativa.');
    patch.status = d.status;
    // Registra a data de finalização (dia local, igual a data_inicio)
    if (d.status === 'finalizada') patch.data_finalizacao = hojeISO();
  }

  if ((await atualizar('gestacao', d.id_gestacao, patch)) === 0) throw new Error('Gestação não encontrada');

  for (const filho of d.filhos ?? []) {
    if (!filho.id_filho) continue;
    await atualizar('filho', filho.id_filho, { nome: filho.nome, sexo: filho.sexo || 'nao_informado' });
  }
  marcarAlterado();
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

type ConsultaForm = { data: string; consulta: string; horario: string; local: string; medico?: string };

const consultaParaLinha = (c: ConsultaForm) => ({
  data: paraISO(c.data),
  descricao: c.consulta,
  horario: normalizarHorario(c.horario),
  local: c.local,
  medico: c.medico || null,
});

export async function listarConsultas(id_gestacao: string) {
  return db.getAllAsync<Record<string, any>>(
    'SELECT * FROM consulta WHERE id_gestacao = ? AND deleted_at IS NULL ORDER BY data, horario',
    id_gestacao,
  );
}

export async function criarConsulta(id_gestacao: string | undefined, c: ConsultaForm) {
  if (!id_gestacao) throw new Error('Nenhuma gestação selecionada.');
  await exigirGestacaoAtiva(id_gestacao, 'Gestação finalizada. Não é possível adicionar novas consultas.');
  await inserir('consulta', { id_consulta: novoId(), id_gestacao, ...consultaParaLinha(c) });
  marcarAlterado();
}

export async function atualizarConsulta(id_consulta: string, c: ConsultaForm) {
  if ((await atualizar('consulta', id_consulta, consultaParaLinha(c))) === 0) throw new Error('Consulta não encontrada');
  marcarAlterado();
}

// Exclusão vira marcação (deleted_at), para a sincronização levar a exclusão ao servidor
export async function excluirConsulta(id_consulta: string) {
  if ((await atualizar('consulta', id_consulta, { deleted_at: agora() })) === 0) throw new Error('Consulta não encontrada');
  marcarAlterado();
}

// ---------------------------------------------------------------------------
// Diário
// ---------------------------------------------------------------------------

export async function listarDiario(id_gestacao: string) {
  return db.getAllAsync<Record<string, any>>(
    'SELECT * FROM diario WHERE id_gestacao = ? AND deleted_at IS NULL ORDER BY data DESC, hora IS NULL, hora DESC',
    id_gestacao,
  );
}

export async function criarDiario(d: { id_gestacao?: string; data: string; hora?: string; reacao: string; descricao: string }) {
  if (!d.id_gestacao) throw new Error('Nenhuma gestação selecionada.');
  await exigirGestacaoAtiva(d.id_gestacao, 'Gestação finalizada. Não é possível adicionar novos registros.');
  await inserir('diario', { ...d, id_diario: novoId(), data: paraISO(d.data), hora: d.hora || null });
  marcarAlterado();
}

// ---------------------------------------------------------------------------
// Desenvolvimento do bebê (conteúdo estático em sint_db.json, semanas 1 a 40)
// ---------------------------------------------------------------------------

const limitarSemana = (s: number) => Math.min(40, Math.max(1, s));

// A gestação informada ou, sem id, a ativa da usuária (null se não houver)
async function gestacaoParaSemana(id_gestacao?: string) {
  return db.getFirstAsync<{
    semanas: number;
    data_inicio: string;
    data_finalizacao: string | null;
    status: string;
  }>(
    `SELECT semanas, data_inicio, data_finalizacao, status FROM gestacao
     WHERE deleted_at IS NULL AND ${id_gestacao ? 'id_gestacao = ?' : "status = 'ativa'"}`,
    id_gestacao ? [id_gestacao] : [],
  );
}

export async function buscarDesenvolvimento(semana?: number, id_gestacao?: string) {
  let semanaAtual = semana;
  if (!semanaAtual) {
    const g = await gestacaoParaSemana(id_gestacao);
    if (g) semanaAtual = calcularSemanaAtual(g.semanas, g.data_inicio, g.data_finalizacao);
  }
  if (!semanaAtual) return null;

  semanaAtual = limitarSemana(semanaAtual);
  const dados = sintDb.find((s) => s.semana === semanaAtual);
  return dados ? { semana_atual: semanaAtual, dados } : null;
}

export async function listarSemanas(id_gestacao?: string) {
  const g = await gestacaoParaSemana(id_gestacao);
  const semanaAtual = limitarSemana(g ? calcularSemanaAtual(g.semanas, g.data_inicio, g.data_finalizacao) : 1);

  return {
    semana_atual: semanaAtual,
    lista: sintDb.map((s) => ({
      semana: s.semana,
      comparacao: s.comparacao,
      tamanho_aproximado: s.tamanho_aproximado,
      url_imagem: s.url_imagem,
      bloqueada: s.semana > semanaAtual,
    })),
    finalizada: g?.status === 'finalizada',
  };
}
