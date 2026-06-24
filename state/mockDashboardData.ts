import { ContentArticle } from "../types/dashboard";
import { PregnancyStatus } from "../types/pregnancy";

export const mockPregnancyData: PregnancyStatus = {
  currentWeek: 12,
  totalWeeks: 45,
  trimester: "1º Trimestre",
  progressPercentage: 27,
  offlineSaved: "Semanas 10-12 salvas offline",
};

export const mockBlocksData: ContentArticle[] = [
  {
    id: "1",
    tag: "Nutrição",
    title: "Nutrição no 1º Trimestre",
    description:
      "O que comer para apoiar o desenvolvimento do bebê nos primeiros meses.",
    readingTime: "5 min de leitura",
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500",
  },
  {
    id: "2",
    tag: "Exercício",
    title: "Exercícios Seguros no Início",
    description:
      "Movimentos suaves e alongamentos ideais para o primeiro trimestre.",
    readingTime: "8 min de leitura",
    imageUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500",
  },
  {
    id: "3",
    tag: "Mental",
    title: "Gerenciando a Ansiedade",
    description:
      "Técnicas de respiração e relaxamento para lidar com as mudanças hormonais.",
    readingTime: "6 min de leitura",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500",
  },
];
