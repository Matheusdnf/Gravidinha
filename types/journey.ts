export interface JourneyTask {
  id: string;
  title: string;
  type: ("Quiz" | "Vídeo")[];
  isCompleted: boolean;
  weekNumber?: number; // Para semanas futuras bloqueadas
}

export interface TrimesterBlock {
  id: string;
  title: string; // Ex: "1º Trimestre", "2º Trimestre", "Pós-parto"
  weeksRange: string; // Ex: "Semanas 1-12"
  description: string; // Resumo textual do bloco
  iconName: string; // Nome do ícone principal do bloco
  isLocked: boolean; // Controla se o bloco todo está trancado
  tasks: JourneyTask[];
}
