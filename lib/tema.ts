import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme, useColorScheme } from "nativewind";
import { Platform } from "react-native";
import { temas } from "../constants/tema";

export type PreferenciaTema = "sistema" | "claro" | "escuro";

const CHAVE = "gravidinha_tema";
const midia =
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
let preferencia: PreferenciaTema = "sistema";

function aplicar() {
  if (!midia) {
    colorScheme.set(preferencia === "sistema" ? "system" : preferencia === "escuro" ? "dark" : "light");
    return;
  }
  // Na web o "system" do NativeWind não põe a classe .dark no <html> (só o JS ficava escuro); resolve aqui
  const escuro = preferencia === "escuro" || (preferencia === "sistema" && midia.matches);
  colorScheme.set(escuro ? "dark" : "light");
  // Campos e barras de rolagem do navegador acompanham, e ele não escurece a página por conta própria
  document.documentElement.style.colorScheme = escuro ? "dark" : "light";
}
midia?.addEventListener("change", () => preferencia === "sistema" && aplicar());

export function preferenciaTema() {
  return preferencia;
}

export function definirTema(p: PreferenciaTema) {
  preferencia = p;
  aplicar();
  AsyncStorage.setItem(CHAVE, p).catch(console.error);
}

export async function carregarTema() {
  const salvo = await AsyncStorage.getItem(CHAVE).catch(() => null);
  if (salvo === "claro" || salvo === "escuro") preferencia = salvo;
  aplicar();
}

// Para cores que vão em prop/style (ícones, placeholder, estilos de bibliotecas)
export function useCores() {
  return temas[useColorScheme().colorScheme === "dark" ? "escuro" : "claro"];
}
