import { ProfileMenuOption, ProfileStats } from "../types/profile";

export const mockProfileStats: ProfileStats = {
  currentWeek: 12,
  readArticles: 18,
  doneQuizzes: 7,
  streakDays: 3,
};

export const mockMenuOptions: ProfileMenuOption[] = [
  {
    id: "1",
    title: "Dados da Gravidez",
    subtitle: "Semana 12 · 1º Trimestre",
    iconName: "baby-face-outline",
    iconColor: "#D97D54",
    bgColor: "bg-[#FDF2EE]",
  },
  {
    id: "2",
    title: "Agenda de Consultas",
    subtitle: "Próxima: 15 de junho",
    iconName: "calendar-month-outline",
    iconColor: "#4FA3A5",
    bgColor: "bg-[#EEF6F6]",
  },
  {
    id: "3",
    title: "Meu Diário",
    subtitle: "3 registros esta semana",
    iconName: "heart-outline",
    iconColor: "#E25C5C",
    bgColor: "bg-[#FDF0F0]",
  },
  {
    id: "4",
    title: "Minhas Conquistas",
    subtitle: "4 emblemas desbloqueados",
    iconName: "star-outline",
    iconColor: "#6366F1",
    bgColor: "bg-[#EEF2FF]",
  },
];
