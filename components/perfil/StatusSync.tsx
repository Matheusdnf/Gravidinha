import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { contarPendentes, sincronizar, useDadosAtualizados } from "../../lib/sync";

// Estado real do modo offline: quantas alterações ainda não chegaram ao servidor. Tocar tenta enviar já.
export function StatusSync() {
  const [pendentes, setPendentes] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  const contar = useCallback(() => {
    contarPendentes().then(setPendentes).catch(console.error);
  }, []);
  useFocusEffect(contar);
  useDadosAtualizados(contar);

  const tentar = () => {
    setEnviando(true);
    sincronizar()
      .then(contar)
      .finally(() => setEnviando(false));
  };

  if (pendentes === null) return null;
  const ok = pendentes === 0;
  const cor = ok ? "#4FA3A5" : "#D97706";

  return (
    <TouchableOpacity
      onPress={tentar}
      disabled={enviando}
      activeOpacity={0.7}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={ok ? "Tudo sincronizado. Toque para verificar" : `${pendentes} alterações aguardando internet. Toque para enviar`}
      className="flex-row items-center mt-1 self-start"
    >
      {enviando ? (
        <ActivityIndicator size="small" color={cor} style={{ transform: [{ scale: 0.6 }] }} />
      ) : (
        <Ionicons name={ok ? "cloud-done-outline" : "cloud-upload-outline"} size={13} color={cor} />
      )}
      <Text style={{ color: cor }} className="text-[11px] font-bold ml-1.5">
        {enviando
          ? "Sincronizando..."
          : ok
            ? "Tudo sincronizado"
            : `${pendentes} ${pendentes === 1 ? "alteração aguardando" : "alterações aguardando"} internet`}
      </Text>
    </TouchableOpacity>
  );
}
