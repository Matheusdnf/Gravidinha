// Substitutos dos módulos nativos para rodar lib/sync.ts e lib/dados.ts no Node (ver hooks.mjs).
// O SQLite é real (node:sqlite, mesmo motor do celular); o Supabase é um servidor em memória
// que imita só o que o app usa e as regras do banco (supabase/migrations): dona via RLS,
// uma gestação ativa (23505), gestação inexistente (23503), sem insert em usuario (42501).
import { DatabaseSync } from 'node:sqlite';
import { randomUUID as uuid } from 'node:crypto';

// ---------------------------------------------------------------------------
// expo-sqlite
// ---------------------------------------------------------------------------

const parametros = (p) => (p.length === 1 && Array.isArray(p[0]) ? p[0] : p);

export async function openDatabaseAsync() {
  const d = new DatabaseSync(':memory:');
  const run = (sql, p) => {
    const r = d.prepare(sql).run(...parametros(p));
    return { changes: Number(r.changes), lastInsertRowId: Number(r.lastInsertRowid) };
  };
  const first = (sql, p) => d.prepare(sql).get(...parametros(p)) ?? null;
  const all = (sql, p) => d.prepare(sql).all(...parametros(p));
  return {
    execAsync: async (sql) => d.exec(sql),
    runAsync: async (sql, ...p) => run(sql, p),
    getFirstAsync: async (sql, ...p) => first(sql, p),
    getAllAsync: async (sql, ...p) => all(sql, p),
    async withTransactionAsync(tarefa) {
      d.exec('BEGIN');
      try {
        await tarefa();
        d.exec('COMMIT');
      } catch (e) {
        d.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// expo-crypto, react, react-native, AsyncStorage
// ---------------------------------------------------------------------------

export const randomUUID = () => uuid();

export const useEffect = () => {};
export const useRef = (valor) => ({ current: valor });

export const Platform = { OS: 'ios' };
export const AppState = { addEventListener: () => ({ remove() {} }) };
export const Alert = { alert() {} };

const guardado = new Map();
export default {
  getItem: async (k) => guardado.get(k) ?? null,
  setItem: async (k, v) => void guardado.set(k, v),
  removeItem: async (k) => void guardado.delete(k),
  multiRemove: async (ks) => ks.forEach((k) => guardado.delete(k)),
  clear: async () => guardado.clear(),
};

// ---------------------------------------------------------------------------
// Supabase em memória
// ---------------------------------------------------------------------------

const PK = { usuario: 'id_user', gestacao: 'id_gestacao', filho: 'id_filho', diario: 'id_diario', consulta: 'id_consulta' };
const SEM_CONEXAO = { code: '', message: 'TypeError: Network request failed' };

export const servidor = {
  online: true,
  falharEscrita: false, // leituras funcionam, escritas falham como sem conexão
  erroPara: new Set(), // ids cuja escrita falha com erro só daquela linha (22P02)
  sessao: null,
  contas: {}, // email → id_user
  tabelas: {},
  relogio: 0,

  resetar() {
    this.online = true;
    this.falharEscrita = false;
    this.erroPara = new Set();
    this.sessao = null;
    this.contas = {};
    this.relogio = 0;
    this.tabelas = Object.fromEntries(Object.keys(PK).map((t) => [t, new Map()]));
  },

  // updated_at sempre crescente, como now() do Postgres entre transações
  agora() {
    return new Date(Date.UTC(2026, 9, 9) + ++this.relogio * 1000).toISOString();
  },

  // Conta com perfil (o trigger do cadastro cria a linha em usuario)
  criarConta(email, nome = 'Usuária') {
    const id = uuid();
    this.contas[email] = id;
    this.tabelas.usuario.set(id, {
      id_user: id, name: nome, cellphone: 11999999999, data_nascimento: '1995-01-01',
      profile_image: null, updated_at: this.agora(), deleted_at: null,
    });
    return id;
  },

  logar(id, email = '') {
    this.sessao = { user: { id, email } };
  },

  // Alteração feita por outro aparelho, direto no servidor
  inserirDireto(tabela, linha) {
    const nova = { deleted_at: null, ...linha, updated_at: this.agora() };
    this.tabelas[tabela].set(nova[PK[tabela]], nova);
    return nova;
  },
  editarDireto(tabela, id, patch) {
    Object.assign(this.tabelas[tabela].get(id), patch, { updated_at: this.agora() });
  },
  linha(tabela, id) {
    return this.tabelas[tabela].get(id) ?? null;
  },
  linhas(tabela) {
    return [...this.tabelas[tabela].values()];
  },
};
servidor.resetar();

function dona(tabela, linha) {
  if (tabela === 'usuario' || tabela === 'gestacao') return linha.id_user;
  return servidor.tabelas.gestacao.get(linha.id_gestacao)?.id_user;
}

function outraAtiva(linha) {
  return linha.status === 'ativa' && !linha.deleted_at &&
    servidor.linhas('gestacao').some((g) =>
      g.id_gestacao !== linha.id_gestacao && g.id_user === linha.id_user && g.status === 'ativa' && !g.deleted_at);
}

class Consulta {
  constructor(tabela) {
    this.tabela = tabela;
    this.op = null;
    this.filtros = [];
    this.limite = Infinity;
    this.unica = false;
  }
  select() { this.op ??= 'select'; return this; }
  update(dados) { this.op = 'update'; this.dados = dados; return this; }
  insert(dados) { this.op = 'insert'; this.dados = dados; return this; }
  eq(c, v) { this.filtros.push((l) => l[c] === v); return this; }
  gt(c, v) { this.filtros.push((l) => l[c] > v); return this; }
  order() { return this; } // o app só ordena por updated_at
  limit(n) { this.limite = n; return this; }
  maybeSingle() { this.unica = true; return this; }
  then(ok, erro) { return Promise.resolve().then(() => this.executar()).then(ok, erro); }

  executar() {
    if (!servidor.online) return { data: null, error: SEM_CONEXAO };
    const uid = servidor.sessao?.user.id;
    const t = this.tabela;
    const pk = PK[t];
    const visiveis = servidor.linhas(t).filter((l) => dona(t, l) === uid && this.filtros.every((f) => f(l)));

    if (this.op === 'select') {
      const data = visiveis.sort((a, b) => (a.updated_at < b.updated_at ? -1 : 1)).slice(0, this.limite).map((l) => ({ ...l }));
      return { data: this.unica ? data[0] ?? null : data, error: null };
    }

    if (servidor.falharEscrita) return { data: null, error: SEM_CONEXAO };
    const id = this.op === 'insert' ? this.dados[pk] : visiveis[0]?.[pk];
    if (servidor.erroPara.has(id)) return { data: null, error: { code: '22P02', message: 'invalid input syntax' } };

    if (this.op === 'update') {
      if (!visiveis.length) return { data: [], error: null };
      const { updated_at, ...patch } = this.dados;
      const nova = { ...visiveis[0], ...patch };
      if (t === 'gestacao' && outraAtiva(nova)) return { data: null, error: { code: '23505', message: 'uq_gestacao_ativa' } };
      servidor.tabelas[t].set(id, { ...nova, updated_at: servidor.agora() });
      return { data: [{ [pk]: id }], error: null };
    }

    // insert
    const { updated_at, ...dados } = this.dados;
    if (t === 'usuario') return { data: null, error: { code: '42501', message: 'permission denied' } };
    if (servidor.tabelas[t].has(id)) return { data: null, error: { code: '23505', message: 'duplicate key' } };
    if (t !== 'gestacao' && !servidor.tabelas.gestacao.has(dados.id_gestacao)) {
      return { data: null, error: { code: '23503', message: 'foreign key' } };
    }
    if (dona(t, dados) !== uid) return { data: null, error: { code: '42501', message: 'row-level security' } };
    if (t === 'gestacao' && outraAtiva(dados)) return { data: null, error: { code: '23505', message: 'uq_gestacao_ativa' } };
    servidor.tabelas[t].set(id, { deleted_at: null, ...dados, updated_at: servidor.agora() });
    return { data: null, error: null };
  }
}

export const supabase = {
  from: (tabela) => new Consulta(tabela),
  auth: {
    async getSession() {
      return { data: { session: servidor.sessao }, error: null };
    },
    async signInWithPassword({ email }) {
      if (!servidor.online) return { data: {}, error: SEM_CONEXAO };
      const id = servidor.contas[email];
      if (!id) return { data: {}, error: { code: 'invalid_credentials' } };
      servidor.logar(id, email);
      return { data: { user: { id }, session: servidor.sessao }, error: null };
    },
    async signOut() {
      servidor.sessao = null;
      return { error: null };
    },
  },
};
