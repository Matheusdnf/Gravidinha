import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes da Aba
import { BadgesGrid } from "../../components/atividades/BadgesGrid";
import { OfensivaSheet } from "../../components/atividades/OfensivaSheet";
import { TabSwitcher } from "../../components/atividades/TabSwitcher";
import { TrilhaMapa } from "../../components/atividades/TrilhaMapa";

import { lerJornada, lerTrilha, type Jornada } from "../../lib/dados";
import { MARCOS } from "../../lib/jornada";
import { useDadosAtualizados } from "../../lib/sync";
import type { EstadoTrilha } from "../../lib/trilha";
import { CHAVE_BOAS_VINDAS, FASES, TEMAS } from "../../lib/trilhaConteudo";
import { useAuth } from "../../state/auth";

export default function AtividadesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Trilha");
  const { aba } = useLocalSearchParams<{ aba?: string }>();
  const [estado, setEstado] = useState<EstadoTrilha | null>(null);
  const [verOfensiva, setVerOfensiva] = useState(false);
  const { selectedGestacao } = useAuth();
  const [jornada, setJornada] = useState<Jornada | null>(null);

  // Um carregamento para a barra, a trilha e as conquistas; volta da lição com o progresso novo.
  // A Jornada (gestação selecionada) entra só nas conquistas.
  const carregar = useCallback(() => {
    lerTrilha().then(setEstado).catch((e) => Alert.alert("Erro", e.message));
    lerJornada(selectedGestacao?.id_gestacao).then(setJornada).catch(console.error);
  }, [selectedGestacao?.id_gestacao]);
  const totalConquistas = 5 + MARCOS.length + 1;
  const ganhas = (estado?.conquistas.length ?? 0) + (jornada ? jornada.marcos.length + (jornada.albumCompleto ? 1 : 0) : 0);
  useFocusEffect(carregar);
  useDadosAtualizados(carregar);

  // Aberta por outra tela já numa aba (Perfil → Minhas Conquistas). Limpa o parâmetro para que
  // o próximo pedido igual mude a aba de novo, mesmo se ela tiver trocado de aba no meio.
  useEffect(() => {
    if (aba !== "Trilha" && aba !== "Conquistas") return;
    setActiveTab(aba);
    router.setParams({ aba: undefined });
  }, [aba]);

  // Primeira visita: explica a trilha antes da parte gamificada
  useEffect(() => {
    AsyncStorage.getItem(CHAVE_BOAS_VINDAS)
      .then((visto) => !visto && router.push("/trilha/boas-vindas"))
      .catch(console.error);
  }, []);

  const proxima = estado && !estado.concluida ? FASES[estado.faseAtual - 1] : null;
  const corProxima = proxima ? TEMAS[proxima.tema - 1] : null;

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
      {/* Barra de status: sempre visível, como no Duolingo */}
      <View className="w-full max-w-2xl mx-auto px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-texto tracking-tight">Atividades</Text>
        <View className="flex-row items-center">
          <Status
            icone="fire"
            cor="#F97316"
            valor={estado?.ofensiva.atual ?? 0}
            rotulo="dias seguidos. Toque para ver o calendário"
            onPress={estado ? () => setVerOfensiva(true) : undefined}
          />
          <Status icone="star" cor="#F5B301" valor={estado?.pontos ?? 0} rotulo="pontos" />
          <Status icone="trophy" cor="#D97D54" valor={`${ganhas}/${totalConquistas}`} rotulo="conquistas" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: proxima && activeTab === "Trilha" ? 120 : 40 }}
        className="w-full max-w-2xl mx-auto"
      >
        <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "Trilha" && estado && <TrilhaMapa estado={estado} recarregar={carregar} />}

        {activeTab === "Conquistas" && estado && <BadgesGrid conquistas={estado.conquistas} jornada={jornada} />}
      </ScrollView>

      {/* Continuar de onde parou, com um toque */}
      {activeTab === "Trilha" && proxima && corProxima && (
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-3 bg-fundo/95 border-t border-borda">
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/trilha/[fase]", params: { fase: String(proxima.numero) } })}
            activeOpacity={0.9}
            style={{ backgroundColor: corProxima.cor, borderBottomWidth: 4, borderColor: corProxima.sombra }}
            className="w-full max-w-2xl mx-auto rounded-2xl px-5 py-3.5 flex-row items-center"
          >
            <View className="bg-white/25 w-10 h-10 rounded-xl items-center justify-center">
              <MaterialCommunityIcons name={corProxima.icone as any} size={22} color="#FFF" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-white/80 text-[11px] font-bold uppercase tracking-wider">
                {Object.keys(estado!.fases[proxima.numero - 1].pontosPorCasa).length ? "Continuar" : "Começar"} · Fase{" "}
                {proxima.numero}
              </Text>
              <Text className="text-white text-base font-extrabold" numberOfLines={1}>
                {proxima.titulo}
              </Text>
            </View>
            <Ionicons name="play" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
      {estado && <OfensivaSheet visible={verOfensiva} onClose={() => setVerOfensiva(false)} ofensiva={estado.ofensiva} />}
    </SafeAreaView>
  );
}

function Status({
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
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      hitSlop={8}
      className="flex-row items-center ml-3"
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={`${valor} ${rotulo}`}
    >
      <MaterialCommunityIcons name={icone as any} size={20} color={cor} />
      <Text style={{ color: cor }} className="font-extrabold text-sm ml-1">
        {valor}
      </Text>
    </TouchableOpacity>
  );
}
