// Regras da Jornada gamificada, sem dependências do app (testadas em Node: npm test).
// A própria gravidez libera as semanas (não dá para adiantar); ver a semana na tela de
// desenvolvimento coleciona a figurinha dela (jornada_figurinha); os marcos abrem quando a
// semana chega, sem exigir nada — progressão sem punição, como na trilha.
import { parseData } from './gestacao';

export const TOTAL_SEMANAS = 40;

// Mesmos limites de getTrimestre (lib/gestacao.ts)
export const TRIMESTRES = [
  { numero: 1, de: 1, ate: 13, titulo: '1º trimestre', cor: '#D97D54', sombra: '#B5603B', icone: 'sprout' },
  { numero: 2, de: 14, ate: 26, titulo: '2º trimestre', cor: '#4FA3A5', sombra: '#367F81', icone: 'baby-face-outline' },
  { numero: 3, de: 27, ate: 40, titulo: '3º trimestre', cor: '#6366F1', sombra: '#4547C9', icone: 'baby-carriage' },
];

// icone: MaterialCommunityIcons
export const MARCOS = [
  { semana: 13, titulo: 'Fim do 1º trimestre', descricao: 'Chegou ao fim do primeiro trimestre', icone: 'flag-variant' },
  { semana: 20, titulo: 'Metade do caminho', descricao: 'Chegou à semana 20, a metade da gestação', icone: 'map-marker-star' },
  { semana: 26, titulo: 'Fim do 2º trimestre', descricao: 'Chegou ao fim do segundo trimestre', icone: 'flag-checkered' },
  { semana: 37, titulo: 'Reta final', descricao: 'Chegou à semana 37: o bebê está quase chegando', icone: 'flower' },
];

export const ALBUM_COMPLETO = { titulo: 'Álbum completo', descricao: 'Colecionou as 40 figurinhas da jornada', icone: 'book-open-page-variant' };

export const trimestreDa = (semana: number) => TRIMESTRES.find((t) => semana <= t.ate) ?? TRIMESTRES[2];

export function estadoJornada(semana: number, figurinhas: number[]) {
  const semanaAtual = Math.min(TOTAL_SEMANAS, Math.max(1, semana));
  const coletadas = new Set(figurinhas);
  const novas = Array.from({ length: semanaAtual }, (_, i) => i + 1).filter((s) => !coletadas.has(s));
  return {
    semanaAtual,
    coletadas,
    novas, // liberadas e ainda não vistas
    liberada: (s: number) => s <= semanaAtual,
    marcos: MARCOS.filter((m) => m.semana <= semanaAtual).map((m) => m.semana),
    albumCompleto: coletadas.size >= TOTAL_SEMANAS,
  };
}

export type EstadoJornada = ReturnType<typeof estadoJornada>;

// Dias até a data provável do parto (nunca negativo); sem DPP cadastrada, estima pelas semanas que faltam
export function diasParaDpp(dpp: string | null | undefined, semanaAtual: number, hoje = new Date()): number {
  if (!dpp) return Math.max(0, (TOTAL_SEMANAS - semanaAtual) * 7);
  const d = parseData(dpp);
  const h = new Date(hoje);
  h.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((d.getTime() - h.getTime()) / 86400000));
}
