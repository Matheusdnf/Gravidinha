export interface QuizHistoryItem {
  id: string;
  weekTitle: string; // Ex: "Semana 11"
  date: string; // Ex: "28/05"
  score: string; // Ex: "4/4"
}

export interface EngagementState {
  streakDays: number;
  currentWeekQuiz: {
    weekNumber: number;
    totalQuestions: number;
    estimatedMinutes: number;
  };
  pastQuizzes: QuizHistoryItem[];
}

export interface WeeklyDay {
  label: string; // Ex: "Seg", "Ter"
  isCompleted: boolean;
}

export interface MoodItem {
  id: string;
  emoji: string;
  label: string; // Ex: "Ótima", "Cansada"
}

export interface ChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  iconName: string; // Nome do ícone ou caractere/emoji ilustrativo
  isUnlocked: boolean;
  type: "sprout" | "target" | "book" | "flower" | "lock";
}
