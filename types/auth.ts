export type User = {
  id: string;
  nome: string;
  email: string;
  celular?: string;
};

export type Gestacao = {
  id_gestacao: string;
  nome: string;
  status: string;
  semanas?: number;
  dpp?: string;
  [key: string]: any;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  excluirConta: () => Promise<void>; // lança Error com mensagem pronta (ex.: sem internet)
  selectedGestacao: Gestacao | null;
  setSelectedGestacao: (gestacao: Gestacao | null) => void;
};
