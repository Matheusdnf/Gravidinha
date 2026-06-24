import { TrimesterBlock } from "../types/journey";

export const mockJourneyData: TrimesterBlock[] = [
  {
    id: "1",
    title: "1º Trimestre",
    weeksRange: "Semanas 1–12",
    description:
      "Primeiras mudanças no corpo, formação dos órgãos do bebê e primeiros cuidados.",
    iconName: "sprout-outline",
    isLocked: false,
    tasks: [
      {
        id: "t1",
        title: "Confirmação da Gravidez",
        type: ["Quiz"],
        isCompleted: true,
      },
      {
        id: "t2",
        title: "Primeiras Mudanças",
        type: ["Vídeo"],
        isCompleted: true,
      },
      {
        id: "t3",
        title: "Desenvolvimento Embrionário",
        type: ["Quiz"],
        isCompleted: true,
      },
      {
        id: "t4",
        title: "1ª Consulta Pré-natal",
        type: ["Vídeo", "Quiz"],
        isCompleted: true,
      },
      { id: "t5", title: "Mudanças no Corpo", type: [], isCompleted: true },
      { id: "t6", title: "Saúde Bucal", type: ["Quiz"], isCompleted: true },
      {
        id: "t7",
        title: "Alimentação e Nutrição",
        type: ["Vídeo"],
        isCompleted: true,
      },
    ],
  },
  {
    id: "2",
    title: "2º Trimestre",
    weeksRange: "Semanas 13–27",
    description:
      "O bebê já se move! Fase de maior conforto e exames importantes.",
    iconName: "lock-outline",
    isLocked: true,
    tasks: [
      {
        id: "t8",
        title: "Entrando no 2º Trimestre",
        type: [],
        isCompleted: false,
        weekNumber: 13,
      },
      {
        id: "t9",
        title: "Movimento Fetal",
        type: ["Vídeo", "Quiz"],
        isCompleted: false,
        weekNumber: 14,
      },
      {
        id: "t10",
        title: "Semana 15",
        type: [],
        isCompleted: false,
        weekNumber: 15,
      },
      {
        id: "t11",
        title: "Semana 16",
        type: [],
        isCompleted: false,
        weekNumber: 16,
      },
    ],
  },
  {
    id: "3",
    title: "3º Trimestre",
    weeksRange: "Semanas 28–40",
    description:
      "Reta final! Preparação para o parto, montagem do enxoval e terceiro trimestre.",
    iconName: "lock-outline",
    isLocked: true,
    tasks: [
      {
        id: "t12",
        title: "Preparando o Plano de Parto",
        type: ["Quiz"],
        isCompleted: false,
        weekNumber: 28,
      },
      {
        id: "t13",
        title: "Sinais do Trabalho de Parto",
        type: ["Vídeo"],
        isCompleted: false,
        weekNumber: 29,
      },
    ],
  },
  {
    id: "4",
    title: "Pós-Parto",
    weeksRange: "Semanas 41–45",
    description:
      "O puerpério, amamentação, os primeiros dias em casa e cuidados com o recém-nascido.",
    iconName: "lock-outline",
    isLocked: true,
    tasks: [
      {
        id: "t14",
        title: "Golden Hour e Amamentação",
        type: ["Vídeo"],
        isCompleted: false,
        weekNumber: 41,
      },
      {
        id: "t15",
        title: "Cuidados com o Umbigo",
        type: ["Quiz"],
        isCompleted: false,
        weekNumber: 42,
      },
    ],
  },
];
