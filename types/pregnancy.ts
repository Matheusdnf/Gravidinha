export interface BabyDevelopment {
  estimatedSize: string;
  estimatedWeight: string;
  weeklyMilestone: string;
}

export interface PregnancyStatus {
  currentWeek: number;
  totalWeeks: number;
  trimester: "1º Trimestre" | "2º Trimestre" | "3º Trimestre";
  progressPercentage: number;
  offlineSaved: string;
}
