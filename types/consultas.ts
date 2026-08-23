export interface Appointment {
  id: string;
  day: string; // Ex: "15"
  month: string; // Ex: "JUN"
  title: string; // Ex: "Consulta Pré-natal"
  doctor: string; // Ex: "Dra. Mariana Costa"
  time: string; // Ex: "14:00"
  location: string; // Ex: "Clínica Mater, Sala 8"
  rawDate?: string; // Data real no formato YYYY-MM-DD para marcar o calendário
}
