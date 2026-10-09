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
