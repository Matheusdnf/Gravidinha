// Regras da trilha gamificada, sem dependências do app (testadas em Node: npm test).
// Só as casas concluídas ficam gravadas (trilha_progresso); pontos, fase liberada e conquistas
// saem delas. Regras da proposta de gamificação: erro não bloqueia, cada casa pontua uma vez por
// partida, fase completa vale +20 e libera a próxima, conquistas ficam mesmo após zerar a partida.

export const TOTAL_FASES = 10;
export const CASAS_POR_FASE = 5;
export const BONUS_FASE = 20;
export const PONTOS_CASA = 10;

// Uma linha de trilha_progresso. fase 0 / casa 0 = marcador de início de partida.
export type LinhaTrilha = { partida: number; fase: number; casa: number; pontos: number };

export type EstadoFase = {
  numero: number;
  pontosPorCasa: Record<number, number>; // casa → pontos já ganhos (presente = concluída)
  completa: boolean;
  liberada: boolean;
};

export type EstadoTrilha = {
  partida: number;
  pontos: number;
  faseAtual: number; // primeira fase incompleta; TOTAL_FASES + 1 = trilha concluída
  concluida: boolean;
  fases: EstadoFase[];
  conquistas: number[]; // temas (1 a 5) já conquistados em qualquer partida
  ofensiva: Ofensiva;
};

export type Ofensiva = {
  atual: number; // dias seguidos até hoje (ou ontem, se hoje ainda não praticou)
  recorde: number; // maior sequência já feita
  total: number; // dias praticados ao todo
  praticouHoje: boolean;
  dias: string[]; // "aaaa-mm-dd" praticados, em ordem
};

const completaEm = (linhas: LinhaTrilha[], partida: number, fase: number) =>
  linhas.filter((l) => l.partida === partida && l.fase === fase && l.casa >= 1).length >= CASAS_POR_FASE;

// dias: "aaaa-mm-dd" de trilha_dia (dias em que alguma casa foi concluída)
export function estadoTrilha(linhas: LinhaTrilha[], dias: string[] = [], hoje = new Date()): EstadoTrilha {
  const partida = Math.max(1, ...linhas.map((l) => l.partida));
  const fases: EstadoFase[] = [];
  let pontos = 0;
  for (let numero = 1; numero <= TOTAL_FASES; numero++) {
    const pontosPorCasa: Record<number, number> = {};
    for (const l of linhas) {
      if (l.partida === partida && l.fase === numero && l.casa >= 1) pontosPorCasa[l.casa] = l.pontos;
    }
    const completa = Object.keys(pontosPorCasa).length >= CASAS_POR_FASE;
    pontos += Object.values(pontosPorCasa).reduce((a, b) => a + b, 0) + (completa ? BONUS_FASE : 0);
    fases.push({ numero, pontosPorCasa, completa, liberada: numero === 1 || fases[numero - 2].completa });
  }

  const faseAtual = (fases.find((f) => !f.completa)?.numero) ?? TOTAL_FASES + 1;
  const partidas = [...new Set(linhas.map((l) => l.partida))];
  const conquistas = [1, 2, 3, 4, 5].filter((tema) => partidas.some((p) => completaEm(linhas, p, tema * 2)));

  return { partida, pontos, faseAtual, concluida: faseAtual > TOTAL_FASES, fases, conquistas, ofensiva: ofensiva(dias, hoje) };
}

// Date → "aaaa-mm-dd" no fuso do aparelho
export const diaISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const diaAnterior = (dia: string) => {
  const [a, m, d] = dia.split('-').map(Number);
  return diaISO(new Date(a, m - 1, d - 1));
};

// Sequência atual termina hoje ou ontem: quem ainda não praticou hoje não perde a ofensiva antes do dia acabar
export function ofensiva(diasPraticados: string[], hoje = new Date()): Ofensiva {
  const dias = [...new Set(diasPraticados)].sort();
  const feitos = new Set(dias);
  const praticouHoje = feitos.has(diaISO(hoje));

  let dia = praticouHoje ? diaISO(hoje) : diaAnterior(diaISO(hoje));
  let atual = 0;
  while (feitos.has(dia)) {
    atual++;
    dia = diaAnterior(dia);
  }

  let recorde = 0;
  let seguidos = 0;
  for (const [i, d] of dias.entries()) {
    seguidos = i > 0 && diaAnterior(d) === dias[i - 1] ? seguidos + 1 : 1;
    recorde = Math.max(recorde, seguidos);
  }

  return { atual, recorde, total: dias.length, praticouHoje, dias };
}

// Onde a lição começa: primeira casa que falta; fase já completa recomeça do início (revisão)
export function casaRetomada(fase: EstadoFase): number {
  for (let casa = 1; casa <= CASAS_POR_FASE; casa++) if (!(casa in fase.pontosPorCasa)) return casa;
  return 1;
}

// Índice de uma das n variações da pergunta, diferente da última vista quando houver outra
export function sortearVariacao(n: number, ultima: number | undefined, aleatorio = Math.random): number {
  if (n <= 1 || ultima === undefined) return Math.floor(aleatorio() * n);
  const i = Math.floor(aleatorio() * (n - 1));
  return i >= ultima ? i + 1 : i;
}

// Fisher-Yates; devolve a nova posição da resposta correta
export function embaralhar(alternativas: string[], correta: number, aleatorio = Math.random) {
  const ordem = alternativas.map((_, i) => i);
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  return { alternativas: ordem.map((i) => alternativas[i]), correta: ordem.indexOf(correta) };
}
