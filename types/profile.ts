export interface ProfileMenuOption {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  onPress?: () => void; // ação própria no lugar da navegação pelo título
  perigo?: boolean; // ação destrutiva (título em vermelho)
}
