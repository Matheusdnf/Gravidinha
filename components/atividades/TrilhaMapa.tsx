import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform, Text, TouchableOpacity, View } from "react-native";
import { AjudaSheet } from "../AjudaSheet";
import { novaPartida } from "../../lib/dados";
import { useCores } from "../../lib/tema";
import { CASAS_POR_FASE, type EstadoFase, type EstadoTrilha } from "../../lib/trilha";
import { FASES, TEMAS } from "../../lib/trilhaConteudo";

type Tema = (typeof TEMAS)[number];

// Por tema o caminho tem 3 paradas (fase ímpar, fase par, baú da conquista) em zigue-zague;
// temas alternam o lado para o caminho serpentear pela tela toda, como no Duolingo.
const DESLOCAMENTOS = [-52, 44, -12];
const nativo = Platform.OS !== "web";

export function TrilhaMapa({ estado, recarregar }: { estado: EstadoTrilha; recarregar: () => void }) {
  const router = useRouter();
  const [ajuda, setAjuda] = useState(false);

  const abrir = (f: EstadoFase) => {
    if (!f.liberada) return Alert.alert("Fase bloqueada", "Conclua a fase anterior para liberar esta.");
    router.push({ pathname: "/trilha/[fase]", params: { fase: String(f.numero) } });
  };

  const recomecar = () =>
    Alert.alert(
      "Nova partida",
      "Seus pontos voltam a zero e a trilha recomeça da fase 1. As conquistas continuam com você.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Começar de novo", onPress: () => novaPartida().then(recarregar).catch((e) => Alert.alert("Erro", e.message)) },
      ],
    );

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.push("/trilha/boas-vindas")}
            activeOpacity={0.85}
            accessibilityRole="button"
            className="flex-row items-center bg-pessego border border-pessego-borda rounded-full px-3 py-1.5"
          >
            <MaterialCommunityIcons name="help-circle-outline" size={14} color="#D97D54" />
            <Text className="text-xs font-bold text-[#D97D54] ml-1.5">Como funciona</Text>
          </TouchableOpacity>
          {estado.partida > 1 && (
            <Text className="text-xs font-bold text-texto-suave ml-2">Partida {estado.partida}</Text>
          )}
        </View>
        {/* Sempre acessível, independente da fase (proposta da gamificação) */}
        <TouchableOpacity
          onPress={() => setAjuda(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="flex-row items-center bg-agua border border-agua-borda rounded-full px-3 py-1.5"
        >
          <MaterialCommunityIcons name="lifebuoy" size={14} color="#4FA3A5" />
          <Text className="text-xs font-bold text-[#4FA3A5] ml-1.5">Precisa de ajuda?</Text>
        </TouchableOpacity>
      </View>

      {estado.concluida && (
        <View className="bg-[#D97D54] rounded-[28px] p-6 mb-8" style={{ borderBottomWidth: 5, borderColor: "#B5603B" }}>
          <Text className="text-white text-xl font-extrabold">Trilha concluída! 🎉</Text>
          <Text className="text-[#FFE6DC] text-sm mt-1 mb-5">
            Revise qualquer fase para completar os pontos que faltam, ou comece uma nova partida.
          </Text>
          <TouchableOpacity onPress={recomecar} activeOpacity={0.9} className="bg-cartao rounded-full py-3 px-6 self-start">
            <Text className="text-[#D97D54] font-bold text-sm">Nova partida</Text>
          </TouchableOpacity>
        </View>
      )}

      {TEMAS.map((tema) => {
        const fases = estado.fases.filter((f) => FASES[f.numero - 1].tema === tema.numero);
        const lado = tema.numero % 2 ? 1 : -1;
        const x = DESLOCAMENTOS.map((d) => d * lado);
        const ganhou = estado.conquistas.includes(tema.numero);
        return (
          <View key={tema.numero} className="mb-6">
            <CabecalhoTema tema={tema} feitas={fases.filter((f) => f.completa).length} total={fases.length} />

            <View className="items-center">
              {/* Ilustração do tema no espaço vazio ao lado do caminho */}
              {/* do lado oposto à 2ª parada, na altura dela */}
              <View pointerEvents="none" style={{ position: "absolute", top: 150, [lado > 0 ? "left" : "right"]: 4 }}>
                <MaterialCommunityIcons name={tema.icone as any} size={84} color={tema.cor} style={{ opacity: 0.14 }} />
              </View>

              {fases.map((f, i) => (
                <View key={f.numero} className="items-center">
                  {i > 0 && <Conector de={x[i - 1]} para={x[i]} cor={fases[i - 1].completa ? tema.cor : undefined} />}
                  <View style={{ transform: [{ translateX: x[i] }] }}>
                    <Bolinha fase={f} tema={tema} atual={f.numero === estado.faseAtual} onPress={() => abrir(f)} />
                  </View>
                </View>
              ))}
              <Conector de={x[1]} para={x[2]} cor={fases[1].completa ? tema.cor : undefined} />
              <View style={{ transform: [{ translateX: x[2] }] }}>
                <Bau tema={tema} ganhou={ganhou} fasePar={fases[1].numero} />
              </View>
            </View>
          </View>
        );
      })}

      <AjudaSheet visible={ajuda} onClose={() => setAjuda(false)} />
    </View>
  );
}

// Faixa da "unidade": cor do tema, título e quantas fases do tema já foram concluídas
function CabecalhoTema({ tema, feitas, total }: { tema: Tema; feitas: number; total: number }) {
  return (
    <View
      style={{ backgroundColor: tema.cor, borderBottomWidth: 5, borderColor: tema.sombra }}
      className="rounded-[22px] px-5 pt-4 pb-4 mb-7 flex-row items-center"
    >
      <View className="flex-1 pr-3">
        <Text className="text-white/80 text-[11px] font-extrabold uppercase tracking-widest">Tema {tema.numero}</Text>
        <Text className="text-white text-base font-extrabold mt-0.5 leading-snug">{tema.titulo}</Text>
        <View className="flex-row items-center mt-3">
          <View className="flex-1 h-2 bg-white/25 rounded-full overflow-hidden">
            <View style={{ width: `${(feitas / total) * 100}%` }} className="h-full bg-white rounded-full" />
          </View>
          <Text className="text-white text-xs font-bold ml-2">
            {feitas}/{total}
          </Text>
        </View>
      </View>
      <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
        <MaterialCommunityIcons name={tema.icone as any} size={26} color="#FFF" />
      </View>
    </View>
  );
}

// Três pontinhos entre duas paradas, acompanhando o zigue-zague; coloridos depois que a parada de cima foi feita
function Conector({ de, para, cor }: { de: number; para: number; cor?: string }) {
  const cores = useCores();
  return (
    <View className="items-center" style={{ height: 40, justifyContent: "space-evenly" }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: cor ?? cores.bordaForte,
            transform: [{ translateX: de + ((para - de) * i) / 4 }],
          }}
        />
      ))}
    </View>
  );
}

function Bolinha({ fase, tema, atual, onPress }: { fase: EstadoFase; tema: Tema; atual: boolean; onPress: () => void }) {
  const cores = useCores();
  const pulo = useRef(new Animated.Value(0)).current;
  const feitas = Object.keys(fase.pontosPorCasa).length;

  // Balão "Começar" quicando sobre a fase atual
  useEffect(() => {
    if (!atual) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulo, { toValue: -6, duration: 600, useNativeDriver: nativo }),
        Animated.timing(pulo, { toValue: 0, duration: 600, useNativeDriver: nativo }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [atual]);

  const bloqueada = !fase.liberada;
  const icone = fase.completa ? "checkmark-sharp" : bloqueada ? "lock-closed" : "star";

  return (
    <View className="items-center" style={{ width: 130 }}>
      {atual && (
        <Animated.View style={{ transform: [{ translateY: pulo }] }} className="items-center mb-1.5">
          <View className="bg-cartao rounded-xl px-3.5 py-2" style={{ borderWidth: 2, borderColor: cores.bordaForte }}>
            <Text style={{ color: tema.cor }} className="text-xs font-extrabold uppercase tracking-wider">
              {feitas ? "Continuar" : "Começar"}
            </Text>
          </View>
          {/* setinha do balão */}
          <View
            style={{
              width: 10,
              height: 10,
              marginTop: -6,
              backgroundColor: cores.cartao,
              borderRightWidth: 2,
              borderBottomWidth: 2,
              borderColor: cores.bordaForte,
              transform: [{ rotate: "45deg" }],
            }}
          />
        </Animated.View>
      )}

      {/* Anel em volta da fase atual */}
      <View
        style={{
          padding: atual ? 6 : 0,
          borderRadius: 50,
          borderWidth: atual ? 4 : 0,
          borderColor: tema.cor + "40",
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Fase ${fase.numero}: ${FASES[fase.numero - 1].titulo}${
            fase.completa ? ", concluída" : bloqueada ? ", bloqueada" : ""
          }`}
          style={{
            width: 74,
            height: 70,
            borderRadius: 37,
            backgroundColor: bloqueada ? cores.bordaForte : tema.cor,
            borderBottomWidth: 7,
            borderColor: bloqueada ? cores.textoFraco : tema.sombra,
          }}
          className="items-center justify-center"
        >
          <Ionicons name={icone} size={30} color={bloqueada ? cores.textoSuave : "#FFF"} />
        </TouchableOpacity>
        {/* Fase começada e não terminada: quantas casas já foram feitas */}
        {feitas > 0 && !fase.completa && (
          <View
            style={{ backgroundColor: tema.sombra, position: "absolute", right: -4, bottom: -2 }}
            className="rounded-full px-1.5 py-0.5 border-2 border-fundo"
          >
            <Text className="text-white text-[10px] font-extrabold">
              {feitas}/{CASAS_POR_FASE}
            </Text>
          </View>
        )}
      </View>

      <Text
        className={`text-xs font-bold mt-2 text-center ${bloqueada ? "text-texto-suave" : "text-texto"}`}
        numberOfLines={2}
      >
        {FASES[fase.numero - 1].titulo}
      </Text>
    </View>
  );
}

// Baú no fim de cada tema: abre (vira a conquista) ao concluir a fase par
function Bau({ tema, ganhou, fasePar }: { tema: Tema; ganhou: boolean; fasePar: number }) {
  const cores = useCores();
  const conquista = FASES[fasePar - 1].conquista!;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Conquista ${conquista.titulo}${ganhou ? ", ganha" : ", bloqueada"}`}
      onPress={() =>
        Alert.alert(
          ganhou ? `🏆 ${conquista.titulo}` : "Conquista bloqueada",
          ganhou ? conquista.descricao : `Conclua a fase ${fasePar} para ganhar “${conquista.titulo}”.`,
        )
      }
      className="items-center"
      style={{ width: 130 }}
    >
      <View
        style={{
          width: 66,
          height: 62,
          borderRadius: 20,
          backgroundColor: ganhou ? tema.cor : cores.creme,
          borderBottomWidth: 6,
          borderColor: ganhou ? tema.sombra : cores.bordaForte,
        }}
        className="items-center justify-center"
      >
        <MaterialCommunityIcons
          name={(ganhou ? conquista.icone : "treasure-chest") as any}
          size={30}
          color={ganhou ? "#FFF" : cores.textoSuave}
        />
      </View>
      <Text className={`text-[11px] font-bold mt-2 text-center ${ganhou ? "text-texto" : "text-texto-suave"}`} numberOfLines={2}>
        {conquista.titulo}
      </Text>
    </TouchableOpacity>
  );
}
