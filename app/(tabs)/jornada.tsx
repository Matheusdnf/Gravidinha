import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabSwitcher } from "../../components/atividades/TabSwitcher";
import { Album } from "../../components/jornadas/Album";
import { CaminhoSemanas } from "../../components/jornadas/CaminhoSemanas";
import { lerJornada, type Jornada } from "../../lib/dados";
import { TOTAL_SEMANAS, TRIMESTRES, trimestreDa } from "../../lib/jornada";
import { useDadosAtualizados } from "../../lib/sync";
import { useAuth } from "../../state/auth";

const ABAS = [
  { nome: "Caminho", icone: "map-marker-path" },
  { nome: "Álbum", icone: "cards-outline" },
];
const CHIPS = [...TRIMESTRES.map((t) => ({ id: t.numero, rotulo: t.titulo.replace(" trimestre", " Tri") })), { id: 4, rotulo: "Pós-parto" }];

export default function JornadaScreen() {
  const router = useRouter();
  const { selectedGestacao } = useAuth();
  const [jornada, setJornada] = useState<Jornada | null | undefined>(undefined); // undefined = carregando
  const [aba, setAba] = useState("Caminho");
  const [chip, setChip] = useState<number | null>(null);

  const scroll = useRef<ScrollView>(null);
  const inicioCaminho = useRef(0); // y do caminho dentro do scroll
  const posicoes = useRef<Record<number, number>>({}); // trimestre → y dentro do caminho
  const rolouParaAtual = useRef(false);

  const carregar = useCallback(() => {
    lerJornada(selectedGestacao?.id_gestacao)
      .then(setJornada)
      .catch((e) => Alert.alert("Erro", e.message));
  }, [selectedGestacao?.id_gestacao]);
  useFocusEffect(carregar); // volta da semana com a figurinha nova
  useDadosAtualizados(carregar);

  const rolarPara = (id: number) => {
    const y = posicoes.current[id];
    if (y !== undefined) scroll.current?.scrollTo({ y: inicioCaminho.current + y - 12, animated: true });
  };

  const abrirSemana = (semana: number) =>
    router.push({ pathname: "/desenvolvimento", params: { semana: String(semana), id_gestacao: jornada?.id_gestacao ?? "" } });

  const escolherChip = (id: number) => {
    setChip(id);
    setAba("Caminho");
    // o caminho precisa estar na tela para ter posição; ao trocar de aba ele ainda vai medir
    requestAnimationFrame(() => rolarPara(id));
  };

  if (jornada === undefined) return <SafeAreaView className="flex-1 bg-fundo" />;

  if (jornada === null) {
    return (
      <SafeAreaView className="flex-1 bg-fundo items-center justify-center px-8">
        <MaterialCommunityIcons name="map-marker-path" size={56} color="#D97D54" />
        <Text className="text-xl font-extrabold text-texto text-center mt-4">Sua jornada começa aqui</Text>
        <Text className="text-sm text-texto-suave text-center mt-2 mb-6">
          Cadastre sua gestação para liberar as semanas e colecionar as figurinhas do bebê.
        </Text>
        <TouchableOpacity onPress={() => router.push("/dados-gravidez")} className="bg-[#D97D54] rounded-full py-3 px-6">
          <Text className="text-white font-bold">Cadastrar gestação</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const t = trimestreDa(jornada.semanaAtual);
  const chipAtivo = chip ?? t.numero;

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Text className="text-2xl font-extrabold text-texto tracking-tight">Jornada</Text>

        {/* Semana atual + contagem para a DPP */}
        <View
          style={{ backgroundColor: t.cor, borderBottomWidth: 6, borderColor: t.sombra }}
          className="rounded-[26px] p-5 mt-4 flex-row items-center"
        >
          <View className="flex-1 pr-3">
            <Text className="text-white/80 text-[11px] font-extrabold uppercase tracking-widest" numberOfLines={1}>
              {jornada.nome || "Minha gestação"}
            </Text>
            <Text className="text-white text-3xl font-extrabold mt-1">Semana {jornada.semanaAtual}</Text>
            <Text className="text-white/90 text-sm font-semibold">{t.titulo}</Text>
            <View className="h-2 bg-white/25 rounded-full overflow-hidden mt-4">
              <View style={{ width: `${(jornada.semanaAtual / TOTAL_SEMANAS) * 100}%` }} className="h-full bg-white rounded-full" />
            </View>
            <Text className="text-white/90 text-[11px] font-bold mt-1.5">
              {jornada.semanaAtual} de {TOTAL_SEMANAS} semanas · {jornada.coletadas.size} figurinhas
            </Text>
          </View>
          <View className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/60 items-center justify-center">
            {jornada.finalizada ? (
              <>
                <MaterialCommunityIcons name="baby-face-outline" size={30} color="#FFF" />
                <Text className="text-white text-[10px] font-bold mt-1">Finalizada</Text>
              </>
            ) : (
              <>
                <Text className="text-white text-2xl font-extrabold">{jornada.diasParaDpp}</Text>
                <Text className="text-white text-[10px] font-bold text-center leading-tight">
                  {jornada.diasParaDpp === 1 ? "dia" : "dias"}
                  {"\n"}para a DPP
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Chips de trimestre: rolam até o trecho do caminho */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5" contentContainerStyle={{ gap: 8 }}>
          {CHIPS.map((c) => {
            const ativo = c.id === chipAtivo;
            const cor = c.id <= 3 ? TRIMESTRES[c.id - 1].cor : "#EC4899";
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => escolherChip(c.id)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                style={{ backgroundColor: ativo ? cor : "transparent", borderColor: cor }}
                className="rounded-full px-4 py-2 border-2"
              >
                <Text style={{ color: ativo ? "#FFF" : cor }} className="text-xs font-extrabold">
                  {c.rotulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TabSwitcher activeTab={aba} setActiveTab={setAba} tabs={ABAS} />

        {aba === "Caminho" ? (
          <View onLayout={(e) => (inicioCaminho.current = e.nativeEvent.layout.y)}>
            <CaminhoSemanas
              jornada={jornada}
              onAbrir={abrirSemana}
              onPosicao={(tri, y) => {
                posicoes.current[tri] = y;
                // Ao abrir a tela, leva até o trimestre atual (uma vez)
                if (tri === t.numero && !rolouParaAtual.current && tri > 1) {
                  rolouParaAtual.current = true;
                  setTimeout(() => rolarPara(tri), 100);
                }
              }}
            />

            {/* Pós-parto: a jornada continua na trilha de saúde mental */}
            <TouchableOpacity
              onLayout={(e) => (posicoes.current[4] = e.nativeEvent.layout.y)}
              onPress={() => router.push("/(tabs)/atividades")}
              activeOpacity={0.9}
              style={{ backgroundColor: "#EC4899", borderBottomWidth: 5, borderColor: "#C0307A" }}
              className="rounded-[22px] p-5 flex-row items-center"
            >
              <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                <MaterialCommunityIcons name="mother-heart" size={26} color="#FFF" />
              </View>
              <View className="flex-1 mx-3">
                <Text className="text-white/80 text-[11px] font-extrabold uppercase tracking-widest">Pós-parto</Text>
                <Text className="text-white text-base font-extrabold">Cuide de você também</Text>
                <Text className="text-white/90 text-xs mt-0.5">Continue na trilha de saúde mental em Atividades</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <Album jornada={jornada} onAbrir={abrirSemana} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
