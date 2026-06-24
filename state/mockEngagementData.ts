import {
  BadgeItem,
  ChecklistItem,
  MoodItem,
  WeeklyDay,
} from "../types/engagement";

import { EngagementState } from "../types/engagement";

export const mockEngagementData: EngagementState = {
  streakDays: 3,
  currentWeekQuiz: {
    weekNumber: 12,
    totalQuestions: 4,
    estimatedMinutes: 5,
  },
  pastQuizzes: [
    { id: "q1", weekTitle: "Semana 11", date: "28/05", score: "4/4" },
    { id: "q2", weekTitle: "Semana 10", date: "21/05", score: "3/4" },
    { id: "q3", weekTitle: "Semana 9", date: "14/05", score: "4/4" },
  ],
};

export const mockWeeklyDays: WeeklyDay[] = [
  { label: "Seg", isCompleted: true },
  { label: "Ter", isCompleted: true },
  { label: "Qua", isCompleted: true },
  { label: "Qui", isCompleted: false },
  { label: "Sex", isCompleted: false },
  { label: "Sáb", isCompleted: false },
  { label: "Dom", isCompleted: false },
];

export const mockMoods: MoodItem[] = [
  { id: "m1", emoji: "😊", label: "Ótima" },
  { id: "m2", emoji: "😐", label: "Normal" },
  { id: "m3", emoji: "😴", label: "Cansada" },
  { id: "m4", emoji: "🤢", label: "Enjoada" },
  { id: "m5", emoji: "😰", label: "Ansiosa" },
];

export const mockChecklist: ChecklistItem[] = [
  { id: "c1", text: "Tomei meu suplemento de ácido fólico", isDone: true },
  { id: "c2", text: "Bebi pelo menos 2L de água", isDone: true },
  { id: "c3", text: "Li um artigo da Cartilha", isDone: false },
];

export const mockBadges: BadgeItem[] = [
  {
    id: "b1",
    title: "Primeira Semana",
    description: "Completou a semana 1",
    iconName: "sprout",
    isUnlocked: true,
    type: "sprout",
  },
  {
    id: "b2",
    title: "Quiz Master",
    description: "5 quizzes corretos",
    iconName: "target",
    isUnlocked: true,
    type: "target",
  },
  {
    id: "b3",
    title: "Leitora Dedicada",
    description: "Leu 10 artigos",
    iconName: "book-open-page-variant",
    isUnlocked: true,
    type: "book",
  },
  {
    id: "b4",
    title: "Trimestre 1",
    description: "Completou o 1º trimestre",
    iconName: "flower",
    isUnlocked: true,
    type: "flower",
  },
  {
    id: "b5",
    title: "Mãe Nutritiva",
    description: "Complete o módulo de nutrição",
    iconName: "lock",
    isUnlocked: false,
    type: "lock",
  },
  {
    id: "b6",
    title: "Sequência 7 dias",
    description: "7 dias consecutivos",
    iconName: "lock",
    isUnlocked: false,
    type: "lock",
  },
];
