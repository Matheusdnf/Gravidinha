/**
 * Converte 'YYYY-MM-DD' (ou ISO com hora) em Date no fuso LOCAL.
 * `new Date('YYYY-MM-DD')` interpreta como UTC e, no Brasil, cai no dia anterior.
 */
export function parseData(data: string | Date): Date {
  if (data instanceof Date) return new Date(data);
  const [y, m, d] = data.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Data de hoje (fuso local) como 'YYYY-MM-DD'. */
export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "dd/mm/aaaa" (com ou sem espaços) vira "aaaa-mm-dd"; outros formatos passam como estão. */
export function paraISO(data?: string | null): string | null {
  if (!data || data.trim() === '') return null;
  const partes = data.replace(/\s/g, '').split('/');
  return partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : data;
}

/** 'YYYY-MM-DD' (ou ISO com hora) vira 'dd/mm/aaaa'. */
export function isoParaBR(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Calcula a semana atual da gestação com base nas semanas informadas
 * no cadastro e no tempo decorrido desde o início da gestação.
 *
 * Esta é a fonte única de verdade para o número de semanas exibido
 * no app — usada nas telas e nas rotas de API.
 *
 * @param semanasIniciais - Semanas informadas no cadastro da gestação
 * @param dataInicio - Data de início da gestação (string ISO ou Date)
 * @param dataFinalizacao - Opcional. Quando informada (gestação finalizada),
 *   a contagem para nesta data e não avança mais.
 * @returns Semana calculada (sem limite máximo)
 */
export function calcularSemanaAtual(
  semanasIniciais: number,
  dataInicio: string | Date,
  dataFinalizacao?: string | Date | null
): number {
  if (!dataInicio) return semanasIniciais || 0;

  const inicio = parseData(dataInicio);
  // Se finalizada, usa a data de finalização como referência; caso contrário, hoje
  const referencia = dataFinalizacao ? parseData(dataFinalizacao) : new Date();

  // Zera as horas para calcular somente a diferença de dias completos
  inicio.setHours(0, 0, 0, 0);
  referencia.setHours(0, 0, 0, 0);

  // Math.round absorve a hora a mais/a menos do horário de verão
  const diffDias = Math.round((referencia.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  const semanasPassadas = Math.floor(diffDias / 7);

  return (semanasIniciais || 0) + semanasPassadas;
}

/**
 * Retorna o trimestre como string com base no número de semanas.
 */
export function getTrimestre(semanas: number) {
  if (!semanas || semanas <= 13) return "1º Trimestre";
  if (semanas <= 26) return "2º Trimestre";
  return "3º Trimestre";
}
