// Decisões da sincronização, sem dependências do app (testadas em Node: npm test).

// Linha vinda do servidor só substitui a local se a local não tiver alteração por enviar
export function deveAplicar(local: { pendente: number } | null): boolean {
  return !local || local.pendente !== 1;
}

// Só marca como enviada se a linha não foi editada de novo enquanto o envio acontecia
export function deveLimparPendente(updatedAtLidoAntes: string, updatedAtAtual: string | null): boolean {
  return updatedAtLidoAntes === updatedAtAtual;
}

// O Postgres devolve "time" como HH:MM:SS; grava localmente no mesmo formato
export function normalizarHorario(h: string): string {
  const [hh, mm, ss = '00'] = h.split(':');
  return [hh.padStart(2, '0'), mm, ss].join(':');
}
