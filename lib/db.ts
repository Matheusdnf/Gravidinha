// Banco SQLite local: cópia dos dados da usuária para o app funcionar sem internet.
// As tabelas espelham as do Supabase (supabase/migrations) + a coluna "pendente"
// (1 = alteração local ainda não enviada). A sincronização fica em lib/sync.ts.
import { openDatabaseSync } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export const db = openDatabaseSync('gravidinha.db');

// Datas, horários e uuids como texto; booleanos como 0/1. Sem foreign keys:
// o pull não garante a ordem de chegada entre tabelas.
if ((db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0) < 1) {
  db.execSync(`
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
}

export type Tabela = {
  nome: 'usuario' | 'gestacao' | 'filho' | 'diario' | 'consulta';
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

export function lerMeta(chave: string): string | null {
  return db.getFirstSync<{ valor: string }>('SELECT valor FROM meta WHERE chave = ?', chave)?.valor ?? null;
}

export function gravarMeta(chave: string, valor: string) {
  db.runSync('INSERT OR REPLACE INTO meta (chave, valor) VALUES (?, ?)', chave, valor);
}
