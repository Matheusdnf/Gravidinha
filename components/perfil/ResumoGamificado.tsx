import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { lerJornada, lerTrilha, type Jornada } from "../../lib/dados";
import { MARCOS, TOTAL_SEMANAS } from "../../lib/jornada";
import { useDadosAtualizados } from "../../lib/sync";
import type { EstadoTrilha } from "../../lib/trilha";
import { useAuth } from "../../state/auth";

// Placar do perfil, como no Duolingo: cada card leva à tela onde aquele número cresce
export function ResumoGamificado() {
  const router = useRouter();
  const { selectedGestacao } = useAuth();
  const [trilha, setTrilha] = useState<EstadoTrilha | null>(null);
  const [jornada, setJornada] = useState<Jornada | null>(null);

  const carregar = useCallback(() => {
    lerTrilha().then(setTrilha).catch(console.error);
    lerJornada(selectedGestacao?.id_gestacao).then(setJornada).catch(console.error);
  }, [selectedGestacao?.id_gestacao]);
  useFocusEffect(carregar);
  useDadosAtualizados(carregar);

  const conquistas = (trilha?.conquistas.length ?? 0) + (jornada ? jornada.marcos.length + (jornada.albumCompleto ? 1 : 0) : 0);
  const atividades = (aba: string) => router.push({ pathname: "/atividades", params: { aba } });

  return (
    <View className="flex-row flex-wrap w-full mb-6" style={{ marginHorizontal: -5 }}>
      <Card icone="fire" cor="#F97316" valor={trilha?.ofensiva.atual ?? 0} rotulo="dias seguidos" onPress={() => atividades("Trilha")} />
      <Card icone="star" cor="#F5B301" valor={trilha?.pontos ?? 0} rotulo="pontos" onPress={() => atividades("Trilha")} />
      <Card
        icone="cards-outline"
        cor="#4FA3A5"
        valor={`${jornada?.coletadas.size ?? 0}/${TOTAL_SEMANAS}`}
        rotulo="figurinhas"
        onPress={() => router.push("/jornada")}
      />
      <Card
        icone="trophy"
        cor="#D97D54"
        valor={`${conquistas}/${5 + MARCOS.length + 1}`}
        rotulo="conquistas"
        onPress={() => atividades("Conquistas")}
      />
    </View>
  );
}

function Card({
  icone,
  cor,
  valor,
  rotulo,
  onPress,
}: {
  icone: string;
  cor: string;
  valor: number | string;
  rotulo: string;
  onPress: () => void;
}) {
  return (
    <View style={{ width: "50%", padding: 5 }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${valor} ${rotulo}`}
        style={{ borderColor: cor + "40", borderWidth: 2, borderBottomWidth: 5 }}
        className="bg-cartao rounded-2xl px-3.5 py-3 flex-row items-center"
      >
        <View style={{ backgroundColor: cor + "1F" }} className="w-10 h-10 rounded-xl items-center justify-center">
          <MaterialCommunityIcons name={icone as any} size={22} color={cor} />
        </View>
        <View className="ml-3 flex-1">
          <Text style={{ color: cor }} className="text-lg font-extrabold leading-tight">
            {valor}
          </Text>
          <Text className="text-[11px] font-bold text-texto-suave">{rotulo}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
