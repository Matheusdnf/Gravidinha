// Banco SQLite local: cópia dos dados da usuária para o app funcionar sem internet.
// As tabelas espelham as do Supabase (supabase/migrations) + a coluna "pendente"
// (1 = alteração local ainda não enviada). A sincronização fica em lib/sync.ts.
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

// Aberto de forma assíncrona: na web o openDatabaseSync estoura o tempo esperando o worker do wa-sqlite subir
const aberto = openDatabaseAsync('gravidinha.db').then(async (d) => {
  await criarTabelas(d);
  return d;
});

type Banco = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync' | 'withTransactionAsync'>;
const usar = (m: keyof Banco) => async (...args: any[]) => {
  const d: any = await aberto;
  return d[m](...args);
};
export const db = {
  runAsync: usar('runAsync'),
  getFirstAsync: usar('getFirstAsync'),
  getAllAsync: usar('getAllAsync'),
  withTransactionAsync: usar('withTransactionAsync'),
} as Banco;

// Datas, horários e uuids como texto; booleanos como 0/1. Sem foreign keys:
// o pull não garante a ordem de chegada entre tabelas.
async function criarTabelas(d: SQLiteDatabase) {
  const versao = (await d.getFirstAsync<{ user_version: number }>('PRAGMA user_version'))?.user_version ?? 0;
  if (versao < 1) await d.execAsync(`
    CREATE TABLE IF NOT EXISTS usuario (
      id_user TEXT PRIMARY KEY, name TEXT, cellphone INTEGER, data_nascimento TEXT, profile_image TEXT,
      updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS gestacao (
      id_gestacao TEXT PRIMARY KEY, id_user TEXT, data_inicio TEXT, nome TEXT, primeira_gestacao INTEGER,
      qtd_bebes TEXT, semanas INTEGER, dpp TEXT, ainda_nao_decidiu_nome INTEGER, status TEXT NOT NULL DEFAULT 'ativa',
      data_finalizacao TEXT, updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS filho (
      id_filho TEXT PRIMARY KEY, id_gestacao TEXT NOT NULL, nome TEXT, sexo TEXT NOT NULL DEFAULT 'nao_informado',
      updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS diario (
      id_diario TEXT PRIMARY KEY, id_gestacao TEXT NOT NULL, data TEXT NOT NULL, hora TEXT, reacao TEXT NOT NULL,
      descricao TEXT NOT NULL, updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS consulta (
      id_consulta TEXT PRIMARY KEY, id_gestacao TEXT NOT NULL, data TEXT NOT NULL, horario TEXT NOT NULL,
      local TEXT NOT NULL, descricao TEXT NOT NULL, medico TEXT,
      updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS meta (chave TEXT PRIMARY KEY, valor TEXT);
    PRAGMA user_version = 1;
  `);
  if (versao < 2) await d.execAsync(`
    CREATE TABLE IF NOT EXISTS trilha_progresso (
      id_progresso TEXT PRIMARY KEY, id_user TEXT, partida INTEGER NOT NULL, fase INTEGER NOT NULL,
      casa INTEGER NOT NULL, pontos INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    PRAGMA user_version = 2;
  `);
  if (versao < 3) await d.execAsync(`
    CREATE TABLE IF NOT EXISTS jornada_figurinha (
      id_figurinha TEXT PRIMARY KEY, id_gestacao TEXT NOT NULL, semana INTEGER NOT NULL,
      updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    PRAGMA user_version = 3;
  `);
  // Dias praticados na trilha; o histórico local sai do progresso (o servidor faz o mesmo na migration)
  if (versao < 4) await d.execAsync(`
    CREATE TABLE IF NOT EXISTS trilha_dia (
      id_dia TEXT PRIMARY KEY, id_user TEXT, dia TEXT NOT NULL,
      updated_at TEXT, deleted_at TEXT, pendente INTEGER NOT NULL DEFAULT 0);
    INSERT OR IGNORE INTO trilha_dia (id_dia, id_user, dia, updated_at, pendente)
      SELECT id_user || ':' || date(updated_at, 'localtime'), id_user, date(updated_at, 'localtime'), MAX(updated_at), 1
      FROM trilha_progresso WHERE casa >= 1 AND updated_at IS NOT NULL
      GROUP BY id_user, date(updated_at, 'localtime');
    PRAGMA user_version = 4;
  `);
}

export type Tabela = {
  nome: 'usuario' | 'gestacao' | 'filho' | 'diario' | 'consulta' | 'trilha_progresso' | 'jornada_figurinha' | 'trilha_dia';
  pk: string;
  colunas: string[]; // colunas do Supabase (sem "pendente")
  booleanas: string[];
};

const comuns = ['updated_at', 'deleted_at'];

// Ordem de envio: pais antes dos filhos
export const TABELAS: Tabela[] = [
  { nome: 'usuario', pk: 'id_user', colunas: ['id_user', 'name', 'cellphone', 'data_nascimento', 'profile_image', ...comuns], booleanas: [] },
  {
    nome: 'gestacao',
    pk: 'id_gestacao',
    colunas: ['id_gestacao', 'id_user', 'data_inicio', 'nome', 'primeira_gestacao', 'qtd_bebes', 'semanas', 'dpp',
      'ainda_nao_decidiu_nome', 'status', 'data_finalizacao', ...comuns],
    booleanas: ['primeira_gestacao', 'ainda_nao_decidiu_nome'],
  },
  { nome: 'filho', pk: 'id_filho', colunas: ['id_filho', 'id_gestacao', 'nome', 'sexo', ...comuns], booleanas: [] },
  { nome: 'diario', pk: 'id_diario', colunas: ['id_diario', 'id_gestacao', 'data', 'hora', 'reacao', 'descricao', ...comuns], booleanas: [] },
  {
    nome: 'consulta',
    pk: 'id_consulta',
    colunas: ['id_consulta', 'id_gestacao', 'data', 'horario', 'local', 'descricao', 'medico', ...comuns],
    booleanas: [],
  },
  {
    nome: 'trilha_progresso',
    pk: 'id_progresso',
    colunas: ['id_progresso', 'id_user', 'partida', 'fase', 'casa', 'pontos', ...comuns],
    booleanas: [],
  },
  { nome: 'jornada_figurinha', pk: 'id_figurinha', colunas: ['id_figurinha', 'id_gestacao', 'semana', ...comuns], booleanas: [] },
  { nome: 'trilha_dia', pk: 'id_dia', colunas: ['id_dia', 'id_user', 'dia', ...comuns], booleanas: [] },
];

export const tabela = (nome: Tabela['nome']) => TABELAS.find((t) => t.nome === nome)!;

// Linha do Supabase → valores para o SQLite (só as colunas conhecidas, booleanos como 0/1)
export function paraLocal(t: Tabela, linha: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const c of t.colunas) {
    const v = linha[c];
    out[c] = t.booleanas.includes(c) ? (v == null ? null : v ? 1 : 0) : v ?? null;
  }
  return out;
}

// Linha do SQLite → payload para o Supabase (updated_at é do servidor; pendente é só local)
export function paraRemoto(t: Tabela, linha: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const c of t.colunas) {
    if (c === 'updated_at') continue;
    const v = linha[c];
    out[c] = t.booleanas.includes(c) ? (v == null ? null : v === 1) : v ?? null;
  }
  return out;
}

// Grava a linha inteira (insert ou substitui) com o estado de envio informado
export async function salvarLocal(t: Tabela, linha: Record<string, any>, pendente: 0 | 1) {
  const valores = paraLocal(t, linha);
  const colunas = [...t.colunas, 'pendente'];
  await db.runAsync(
    `INSERT OR REPLACE INTO ${t.nome} (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`,
    [...t.colunas.map((c) => valores[c]), pendente],
  );
}

// Linha vinda do servidor: grava só se não houver alteração local pendente (checado no mesmo comando,
// sem janela entre ler e gravar). Devolve se gravou.
export async function salvarDoServidor(t: Tabela, linha: Record<string, any>): Promise<boolean> {
  const valores = paraLocal(t, linha);
  const { changes } = await db.runAsync(
    `INSERT INTO ${t.nome} (${t.colunas.join(', ')}, pendente) VALUES (${t.colunas.map(() => '?').join(', ')}, 0)
     ON CONFLICT(${t.pk}) DO UPDATE SET ${t.colunas.map((c) => `${c} = excluded.${c}`).join(', ')}
     WHERE ${t.nome}.pendente = 0`,
    t.colunas.map((c) => valores[c]),
  );
  return changes > 0;
}

export const agora = () => new Date().toISOString();
export const novoId = () => Crypto.randomUUID();

export async function lerMeta(chave: string): Promise<string | null> {
  return (await db.getFirstAsync<{ valor: string }>('SELECT valor FROM meta WHERE chave = ?', chave))?.valor ?? null;
}

export async function gravarMeta(chave: string, valor: string) {
  await db.runAsync('INSERT OR REPLACE INTO meta (chave, valor) VALUES (?, ?)', chave, valor);
}
