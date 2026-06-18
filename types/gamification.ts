import { ReactNode } from "react";

export interface QuickAccessItem {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  icon: ReactNode;
}
