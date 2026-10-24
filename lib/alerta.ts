// Alertas do app. Assume o Alert.alert do React Native (mesma assinatura), então todas as telas
// passam a usar o visual do app (components/AlertaHost.tsx) sem mudar as chamadas.
import { Alert, type AlertButton, type AlertOptions } from "react-native";

export type PedidoAlerta = {
  titulo: string;
  mensagem?: string;
  botoes: AlertButton[];
  opcoes?: AlertOptions;
};

const fila: PedidoAlerta[] = [];
const ouvintes = new Set<(atual: PedidoAlerta | null) => void>();
const notificar = () => ouvintes.forEach((cb) => cb(fila[0] ?? null));

export function aoMudarAlerta(cb: (atual: PedidoAlerta | null) => void): () => void {
  ouvintes.add(cb);
  cb(fila[0] ?? null);
  return () => { ouvintes.delete(cb); };
}

// Um alerta por vez; os demais esperam na fila
export function mostrarAlerta(
  titulo: string,
  mensagem?: string,
  botoes?: AlertButton[],
  opcoes?: AlertOptions,
) {
  fila.push({ titulo, mensagem, botoes: botoes?.length ? botoes : [{ text: "OK" }], opcoes });
  if (fila.length === 1) notificar();
}

export function fecharAlerta() {
  fila.shift();
  notificar();
}

export function instalarAlertas() {
  Alert.alert = mostrarAlerta;
}
