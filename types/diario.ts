export interface HumorOption {
  id: string;
  emoji: string;
  label: string;
}

export interface DiarioEntry {
  id: string;
  humor: HumorOption;
  data: string;
  hora?: string;
  texto: string;
}
