export interface ProfileStats {
  currentWeek: number;
  readArticles: number;
  doneQuizzes: number;
  streakDays: number;
}

export interface ProfileMenuOption {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
}
