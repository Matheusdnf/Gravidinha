// Decisões da sincronização, sem dependências do app (testadas em Node: npm test).

// Linha vinda do servidor só substitui a local se a local não tiver alteração por enviar
export function deveAplicar(local: { pendente: number } | null): boolean {
  return !local || local.pendente !== 1;
}

// O Postgres devolve "time" como HH:MM:SS; grava localmente no mesmo formato
export function normalizarHorario(h: string): string {
  const [hh, mm, ss = '00'] = h.split(':');
  return [hh.padStart(2, '0'), mm, ss].join(':');
}

// O pull devolve as linhas que a própria usuária acabou de enviar (o servidor troca o updated_at);
// só conta como novidade, para recarregar as telas, se algum dado de fato mudou
export function linhaMudou(
  local: Record<string, any> | null,
  remota: Record<string, any>,
  colunas: string[],
): boolean {
  return !local || colunas.some((c) => c !== 'updated_at' && (local[c] ?? null) !== (remota[c] ?? null));
}

// Códigos em que o servidor recusa a linha por regra: não adianta reenviar, a versão dele vence
export const CODIGOS_REJEICAO = ['23505', '42501', '23503', '23514'];

// O que o push faz com um erro: descartar a linha, parar tudo (sem internet) ou pular só esta linha
export function classificarErro(error: { code?: string }): 'rejeitada' | 'sem_conexao' | 'pular' {
  if (!error.code) return 'sem_conexao';
  return CODIGOS_REJEICAO.includes(error.code) ? 'rejeitada' : 'pular';
}
