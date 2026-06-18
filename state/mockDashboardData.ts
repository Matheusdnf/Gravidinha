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
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=300",
  },
  {
    id: "2",
    tag: "Exercício",
    title: "Exercícios Seguros na Gestação",
    description: "Movimentos suaves aprovados para o primeiro trimestre.",
    readingTime: "8 min de leitura",
    imageUrl:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=300",
  },
];
