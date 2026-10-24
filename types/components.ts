import { ReactNode } from "react";

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onDayPress: (day: any) => void;
  /** Tela inicial quando não há data selecionada (ex.: "year" para data de nascimento). */
  maxDate?: string;
}

export interface TabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs?: { nome: string; icone: string }[]; // icone: MaterialCommunityIcons; padrão = abas de Atividades
}

export interface QuickAccessButtonProps {
  title: string;
  subtitle: string;
  bgColor: string;
  icon: ReactNode;
}

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDestructive?: boolean;
}
