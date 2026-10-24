import { useEffect, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { aoMudarAlerta, fecharAlerta, type PedidoAlerta } from "../lib/alerta";
import { useCores } from "../lib/tema";
import { FullScreenModal } from "./FullScreenModal";

// Ícone pelo tom: botão destrutivo = aviso; senão, pelo título que as telas já usam ("Erro", "Sucesso")
function tom(p: PedidoAlerta) {
  if (p.botoes.some((b) => b.style === "destructive")) return "aviso";
  if (/^erro/i.test(p.titulo)) return "erro";
  if (/^sucesso/i.test(p.titulo)) return "sucesso";
  return "info";
}

const TONS = {
  aviso: { icone: "warning", cor: "#E25C5C", fundo: "vermelho" },
  erro: { icone: "close-circle", cor: "#E25C5C", fundo: "vermelho" },
  sucesso: { icone: "checkmark-circle", cor: "#4FA3A5", fundo: "agua" },
  info: { icone: "information-circle", cor: "#D97D54", fundo: "pessego" },
} as const;

// Montado uma vez na raiz (app/_layout.tsx)
export function AlertaHost() {
  const cores = useCores();
  const [atual, setAtual] = useState<PedidoAlerta | null>(null);
  useEffect(() => aoMudarAlerta(setAtual), []);

  // Mantém o último conteúdo durante a animação de saída
  const [ultimo, setUltimo] = useState<PedidoAlerta | null>(null);
  useEffect(() => { if (atual) setUltimo(atual); }, [atual]);
  const p = atual ?? ultimo;
  if (!p) return null;

  const t = TONS[tom(p)];
  const cancelar = p.botoes.find((b) => b.style === "cancel");
  // Principais primeiro, "cancelar" por último
  const botoes = [...p.botoes.filter((b) => b !== cancelar), ...(cancelar ? [cancelar] : [])];

  const tocar = (b?: (typeof p.botoes)[number]) => {
    fecharAlerta();
    b?.onPress?.();
  };
  // Toque fora / botão voltar: age como "cancelar"; sem ele, só fecha se for um aviso simples ou cancelável
  const dispensar = () => {
    if (cancelar) return tocar(cancelar);
    if (p.botoes.length === 1 || p.opcoes?.cancelable) {
      fecharAlerta();
      p.opcoes?.onDismiss?.();
    }
  };

  return (
    <FullScreenModal visible={!!atual} onClose={dispensar} animationType="fade">
      <Pressable
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
        onPress={dispensar}
      >
        <Pressable
          style={{
            backgroundColor: cores.cartao,
            width: "100%",
            maxWidth: 384,
            borderRadius: 32,
            padding: 24,
            boxShadow: "0 0 24px rgba(0,0,0,0.15)",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ alignItems: "center", marginBottom: 20, marginTop: 8 }}>
            <View
              style={{
                width: 64, height: 64, borderRadius: 32, marginBottom: 16,
                backgroundColor: cores[t.fundo], alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name={t.icone} size={32} color={t.cor} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: cores.texto, textAlign: "center", marginBottom: 8 }}>
              {p.titulo}
            </Text>
            {!!p.mensagem && (
              <Text style={{ fontSize: 14, fontWeight: "500", color: cores.textoSuave, textAlign: "center", lineHeight: 20 }}>
                {p.mensagem}
              </Text>
            )}
          </View>

          {botoes.map((b, i) => {
            const secundario = b === cancelar;
            const destrutivo = b.style === "destructive";
            return (
              <TouchableOpacity
                key={i}
                onPress={() => tocar(b)}
                activeOpacity={0.9}
                style={{
                  width: "100%", borderRadius: 16, paddingVertical: 14, alignItems: "center",
                  marginTop: i === 0 ? 0 : 12,
                  backgroundColor: secundario ? cores.suave : destrutivo ? "#E25C5C" : "#D97D54",
                  borderWidth: secundario ? 1 : 0,
                  borderColor: cores.borda,
                }}
              >
                <Text style={{ color: secundario ? cores.textoSuave : "#fff", fontWeight: "700", fontSize: 14 }}>
                  {b.text ?? "OK"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </FullScreenModal>
  );
}
