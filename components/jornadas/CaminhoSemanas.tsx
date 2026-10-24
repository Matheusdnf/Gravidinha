import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Alert, Animated, Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { imagensSemanas } from "../../constants/imagesSemanas";
import type { Jornada } from "../../lib/dados";
import { MARCOS, TRIMESTRES } from "../../lib/jornada";
import { useCores } from "../../lib/tema";
import { DECOR_TRIMESTRE, FundoDecorado } from "./FundoDecorado";

type Trimestre = (typeof TRIMESTRES)[number];
type Marco = (typeof MARCOS)[number];
type Parada = { tipo: "semana"; semana: number } | { tipo: "marco"; marco: Marco };

// Zigue-zague do caminho (mesmo desenho da trilha de Atividades)
const ZIGUE = [0, 48, 72, 48, 0, -48, -72, -48];
const nativo = Platform.OS !== "web";

export function CaminhoSemanas({
  jornada,
  onAbrir,
  onPosicao,
}: {
  jornada: Jornada;
  onAbrir: (semana: number) => void;
  onPosicao: (trimestre: number, y: number) => void; // para os chips rolarem até o trimestre
}) {
  let k = 0; // índice global da parada, para o zigue-zague continuar entre trimestres
  return (
    <View>
      {TRIMESTRES.map((t) => {
        const paradas: Parada[] = [];
        for (let s = t.de; s <= t.ate; s++) {
          paradas.push({ tipo: "semana", semana: s });
          const m = MARCOS.find((m) => m.semana === s);
          if (m) paradas.push({ tipo: "marco", marco: m });
        }
        const total = t.ate - t.de + 1;
        const coletadas = paradas.filter((p) => p.tipo === "semana" && jornada.coletadas.has(p.semana)).length;
        const x = paradas.map(() => ZIGUE[k++ % ZIGUE.length]);

        return (
          <View key={t.numero} className="mb-6" onLayout={(e) => onPosicao(t.numero, e.nativeEvent.layout.y)}>
            <View
              style={{ backgroundColor: t.cor, borderBottomWidth: 5, borderColor: t.sombra }}
              className="rounded-[22px] px-5 py-4 mb-7 flex-row items-center"
            >
              <View className="flex-1 pr-3">
                <Text className="text-white/80 text-[11px] font-extrabold uppercase tracking-widest">
                  Semanas {t.de}–{t.ate}
                </Text>
                <Text className="text-white text-lg font-extrabold mt-0.5">{t.titulo}</Text>
                <View className="flex-row items-center mt-3">
                  <View className="flex-1 h-2 bg-white/25 rounded-full overflow-hidden">
                    <View style={{ width: `${(coletadas / total) * 100}%` }} className="h-full bg-white rounded-full" />
                  </View>
                  <Text className="text-white text-xs font-bold ml-2">
                    {coletadas}/{total} figurinhas
                  </Text>
                </View>
              </View>
              <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                <MaterialCommunityIcons name={t.icone as any} size={26} color="#FFF" />
              </View>
            </View>

            <View className="items-center">
              <FundoDecorado icones={DECOR_TRIMESTRE[t.numero]} cor={t.cor} />
              {paradas.map((p, i) => {
                const anteriorFeita = i > 0 && feita(paradas[i - 1], jornada);
                return (
                  <View key={p.tipo === "semana" ? `s${p.semana}` : `m${p.marco.semana}`} className="items-center">
                    {i > 0 && <Conector de={x[i - 1]} para={x[i]} cor={anteriorFeita ? t.cor : undefined} />}
                    <View style={{ transform: [{ translateX: x[i] }] }}>
                      {p.tipo === "semana" ? (
                        <Semana semana={p.semana} jornada={jornada} trimestre={t} onPress={() => onAbrir(p.semana)} />
                      ) : (
                        <MarcoParada marco={p.marco} alcancado={jornada.marcos.includes(p.marco.semana)} trimestre={t} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const feita = (p: Parada, j: Jornada) =>
  p.tipo === "semana" ? j.coletadas.has(p.semana) : j.marcos.includes(p.marco.semana);

function Conector({ de, para, cor }: { de: number; para: number; cor?: string }) {
  const cores = useCores();
  return (
    <View className="items-center" style={{ height: 30, justifyContent: "space-evenly" }}>
      {[1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: cor ?? cores.bordaForte,
            transform: [{ translateX: de + ((para - de) * i) / 3 }],
          }}
        />
      ))}
    </View>
  );
}

function Semana({
  semana,
  jornada,
  trimestre,
  onPress,
}: {
  semana: number;
  jornada: Jornada;
  trimestre: Trimestre;
  onPress: () => void;
}) {
  const cores = useCores();
  const pulo = useRef(new Animated.Value(0)).current;
  const atual = semana === jornada.semanaAtual;
  const bloqueada = !jornada.liberada(semana);
  const coletada = jornada.coletadas.has(semana);

  // Balão quicando sobre a semana atual
  useEffect(() => {
    if (!atual) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulo, { toValue: -5, duration: 600, useNativeDriver: nativo }),
        Animated.timing(pulo, { toValue: 0, duration: 600, useNativeDriver: nativo }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [atual]);

  return (
    <View className="items-center" style={{ width: 120 }}>
      {atual && (
        <Animated.View style={{ transform: [{ translateY: pulo }] }} className="items-center mb-1.5">
          <View className="bg-cartao rounded-xl px-3 py-1.5" style={{ borderWidth: 2, borderColor: cores.bordaForte }}>
            <Text style={{ color: trimestre.cor }} className="text-[11px] font-extrabold uppercase tracking-wider">
              {jornada.finalizada ? "Última semana" : "Você está aqui"}
            </Text>
          </View>
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

      <View style={{ padding: atual ? 5 : 0, borderRadius: 44, borderWidth: atual ? 4 : 0, borderColor: trimestre.cor + "40" }}>
        <TouchableOpacity
          onPress={() => (bloqueada ? Alert.alert(`Semana ${semana}`, "Esta semana abre quando a sua gestação chegar nela.") : onPress())}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Semana ${semana}${bloqueada ? ", ainda não chegou" : coletada ? ", figurinha coletada" : ", nova figurinha"}`}
          style={{
            width: 64,
            height: 62,
            borderRadius: 32,
            overflow: "hidden",
            backgroundColor: bloqueada ? cores.bordaForte : coletada ? cores.cartao : trimestre.cor,
            borderWidth: coletada ? 3 : 0,
            borderBottomWidth: 6,
            borderColor: bloqueada ? cores.textoFraco : trimestre.sombra,
          }}
          className="items-center justify-center"
        >
          {coletada ? (
            imagensSemanas[semana] ? (
              <Image source={imagensSemanas[semana]} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              // semana ainda sem ilustração (constants/imagesSemanas.ts)
              <MaterialCommunityIcons name={trimestre.icone as any} size={28} color={trimestre.cor} />
            )
          ) : bloqueada ? (
            <Ionicons name="lock-closed" size={22} color={cores.textoSuave} />
          ) : (
            <Ionicons name="sparkles" size={26} color="#FFF" />
          )}
        </TouchableOpacity>
        {!bloqueada && !coletada && (
          <View
            style={{ backgroundColor: "#F5B301", position: "absolute", right: -6, top: -4 }}
            className="rounded-full px-1.5 py-0.5 border-2 border-fundo"
          >
            <Text className="text-white text-[9px] font-extrabold">NOVA</Text>
          </View>
        )}
      </View>
      <Text className={`text-xs font-bold mt-1.5 ${bloqueada ? "text-texto-suave" : "text-texto"}`}>Semana {semana}</Text>
    </View>
  );
}

// Marco da gestação: abre sozinho quando a semana chega
function MarcoParada({ marco, alcancado, trimestre }: { marco: Marco; alcancado: boolean; trimestre: Trimestre }) {
  const cores = useCores();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Marco ${marco.titulo}${alcancado ? ", alcançado" : ""}`}
      onPress={() =>
        Alert.alert(
          alcancado ? `🏅 ${marco.titulo}` : marco.titulo,
          alcancado ? marco.descricao : `Abre quando a gestação chegar à semana ${marco.semana}.`,
        )
      }
      className="items-center"
      style={{ width: 120 }}
    >
      <View
        style={{
          width: 62,
          height: 58,
          borderRadius: 18,
          backgroundColor: alcancado ? "#F5B301" : cores.creme,
          borderBottomWidth: 6,
          borderColor: alcancado ? "#C98F00" : cores.bordaForte,
        }}
        className="items-center justify-center"
      >
        <MaterialCommunityIcons
          name={(alcancado ? marco.icone : "treasure-chest") as any}
          size={28}
          color={alcancado ? "#FFF" : cores.textoSuave}
        />
      </View>
      <Text
        style={alcancado ? { color: trimestre.sombra } : undefined}
        className={`text-[11px] font-extrabold mt-1.5 text-center ${alcancado ? "" : "text-texto-suave"}`}
        numberOfLines={2}
      >
        {marco.titulo}
      </Text>
    </TouchableOpacity>
  );
}
