import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { concluirCasa, lerTrilha } from "../../lib/dados";
import { useCores } from "../../lib/tema";
import { CASAS_POR_FASE, PONTOS_CASA, casaRetomada, embaralhar, sortearVariacao, type EstadoTrilha } from "../../lib/trilha";
import { FASES, TEMAS, type Quiz } from "../../lib/trilhaConteudo";

// Última variação vista em cada casa de quiz ("fase:casa"), para a revisão mostrar outra pergunta.
// Só na memória: ao reabrir o app qualquer variação serve.
const ultimas = new Map<string, number>();

const vibrar = (acertou: boolean) => {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(acertou ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
};

type Resposta = { escolha: number; acertou: boolean; ganhou: boolean };

export default function LicaoScreen() {
  const cores = useCores();
  const router = useRouter();
  const numero = Number(useLocalSearchParams<{ fase: string }>().fase);
  const fase = FASES[numero - 1];
  const tema = TEMAS[(fase?.tema ?? 1) - 1];
  const cor = tema.cor;

  const [inicial, setInicial] = useState<EstadoTrilha | null>(null);
  const [atual, setAtual] = useState<EstadoTrilha | null>(null);
  const [casa, setCasa] = useState(1);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const [fim, setFim] = useState(false);
  const [acertos, setAcertos] = useState({ certas: 0, total: 0 }); // quizzes respondidos nesta lição

  useEffect(() => {
    if (!fase) return router.back();
    lerTrilha()
      .then((e) => {
        if (!e.fases[numero - 1].liberada) return router.back();
        setInicial(e);
        setAtual(e);
        setCasa(casaRetomada(e.fases[numero - 1]));
      })
      .catch((e) => Alert.alert("Erro", e.message));
  }, [numero]);

  const conteudo = fase?.casas[casa - 1];

  // Pergunta sorteada e alternativas embaralhadas uma vez por casa
  const pergunta = useMemo(() => {
    if (conteudo?.tipo !== "quiz") return null;
    const chave = `${numero}:${casa}`;
    const i = sortearVariacao((conteudo as Quiz).variacoes.length, ultimas.get(chave));
    ultimas.set(chave, i);
    const v = (conteudo as Quiz).variacoes[i];
    return { ...v, ...embaralhar(v.alternativas, v.correta) };
  }, [numero, casa]);

  if (!fase || !inicial || !atual || !conteudo) return <SafeAreaView className="flex-1 bg-fundo" />;

  const ganhoLicao = atual.pontos - inicial.pontos;
  const pontosAntes = inicial.fases[numero - 1].pontosPorCasa[casa]; // undefined = casa nunca feita

  const salvar = async (pontos: number) => {
    await concluirCasa(numero, casa, pontos);
    setAtual(await lerTrilha());
  };

  const avancar = () => {
    setEscolha(null);
    setResposta(null);
    if (casa >= CASAS_POR_FASE) setFim(true);
    else setCasa(casa + 1);
  };

  const verificar = async () => {
    if (escolha === null) return;
    try {
      if (conteudo.tipo === "quiz") {
        const acertou = escolha === pergunta!.correta;
        const pontos = acertou ? PONTOS_CASA : 0;
        setResposta({ escolha, acertou, ganhou: acertou && (pontosAntes ?? 0) < PONTOS_CASA });
        setAcertos((a) => ({ certas: a.certas + (acertou ? 1 : 0), total: a.total + 1 }));
        vibrar(acertou);
        await salvar(pontos);
      } else {
        setResposta({ escolha, acertou: true, ganhou: pontosAntes === undefined });
        vibrar(true);
        await salvar(PONTOS_CASA);
      }
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    }
  };

  const continuarExplicacao = () =>
    salvar(0)
      .then(avancar)
      .catch((e) => Alert.alert("Erro", e.message));

  if (fim) {
    const conquistou = fase.conquista && atual.conquistas.includes(fase.tema) && !inicial.conquistas.includes(fase.tema);
    return (
      <SafeAreaView className="flex-1 bg-fundo">
        <View className="flex-1 items-center justify-center px-8 w-full max-w-2xl mx-auto">
          <Estrelas cor={cor} />
          <View
            style={{ backgroundColor: cor, borderBottomWidth: 7, borderColor: tema.sombra }}
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
          >
            <Ionicons name="trophy" size={44} color="#FFF" />
          </View>
          <Text className="text-2xl font-extrabold text-texto text-center">Fase concluída!</Text>
          <Text className="text-base text-texto-suave mt-2 text-center">{fase.titulo}</Text>
          <View className="flex-row mt-7 w-full">
            <Resumo icone="star" cor="#F5B301" valor={`+${ganhoLicao}`} rotulo="pontos" />
            {acertos.total > 0 && (
              <Resumo icone="check-circle" cor="#4FA3A5" valor={`${acertos.certas}/${acertos.total}`} rotulo="acertos" />
            )}
          </View>
          {conquistou && (
            <View className="bg-cartao border border-borda rounded-[24px] p-5 mt-6 items-center w-full">
              <Text className="text-xs font-bold uppercase tracking-wider text-texto-suave">Nova conquista</Text>
              <MaterialCommunityIcons name={fase.conquista!.icone as any} size={36} color={cor} style={{ marginTop: 10 }} />
              <Text className="text-lg font-extrabold text-texto mt-2">{fase.conquista!.titulo}</Text>
              <Text className="text-xs text-texto-suave mt-1 text-center">{fase.conquista!.descricao}</Text>
            </View>
          )}
        </View>
        <View className="px-6 pb-6 w-full max-w-2xl mx-auto">
          <Botao texto="Continuar" cor={cor} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const opcoes =
    conteudo.tipo === "quiz" ? pergunta!.alternativas : conteudo.tipo === "situacao" ? conteudo.escolhas.map((e) => e.texto) : [];

  return (
    <SafeAreaView className="flex-1 bg-fundo">
      <View className="flex-1 w-full max-w-2xl mx-auto">
        {/* Topo: sair, progresso das casas, pontos da lição */}
        <View className="flex-row items-center px-5 pt-3 pb-4">
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Sair da lição" hitSlop={12}>
            <Ionicons name="close" size={26} color={cores.textoSuave} />
          </TouchableOpacity>
          <View className="flex-1 h-3.5 bg-creme rounded-full mx-4 overflow-hidden">
            <View
              style={{ width: `${((casa - 1 + (resposta ? 1 : 0)) / CASAS_POR_FASE) * 100}%`, backgroundColor: cor }}
              className="h-full rounded-full"
            />
          </View>
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#D97D54" />
            <Text className="text-[#D97D54] font-extrabold ml-1">{ganhoLicao}</Text>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          {conteudo.tipo === "explicacao" && (
            <>
              <View style={{ backgroundColor: cor + "22" }} className="w-20 h-20 rounded-3xl items-center justify-center mb-6 self-center">
                <MaterialCommunityIcons name={tema.icone as any} size={44} color={cor} />
              </View>
              <Text style={{ color: cor }} className="text-xs font-extrabold uppercase tracking-wider mb-2">
                Você sabia?
              </Text>
              <Text className="text-2xl font-extrabold text-texto mb-4">{conteudo.titulo}</Text>
              <Text className="text-base text-texto-2 leading-relaxed">{conteudo.texto}</Text>
              {conteudo.topicos?.map((t) => (
                <View key={t.titulo} style={{ backgroundColor: cor + "14" }} className="flex-row items-center rounded-2xl p-3 mt-3">
                  <View style={{ backgroundColor: cor + "26" }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <MaterialCommunityIcons name={t.icone as any} size={22} color={cor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-texto">{t.titulo}</Text>
                    <Text className="text-sm text-texto-2 leading-snug">{t.texto}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {conteudo.tipo !== "explicacao" && (
            <>
              <Text className="text-xs font-bold uppercase tracking-wider text-texto-suave mb-2">
                {conteudo.tipo === "quiz" ? "Quiz" : "Situação"}
              </Text>
              <Text className="text-xl font-extrabold text-texto mb-6">
                {conteudo.tipo === "quiz" ? pergunta!.pergunta : conteudo.cenario}
              </Text>
              {opcoes.map((texto, i) => {
                const marcada = (resposta?.escolha ?? escolha) === i;
                const correta = conteudo.tipo === "quiz" && resposta && i === pergunta!.correta;
                const errada = conteudo.tipo === "quiz" && resposta && marcada && !resposta.acertou;
                return (
                  <TouchableOpacity
                    key={texto}
                    disabled={!!resposta}
                    onPress={() => setEscolha(i)}
                    activeOpacity={0.85}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: marcada }}
                    style={{
                      borderColor: correta ? "#4FA3A5" : errada ? "#E25C5C" : marcada ? cor : cores.bordaForte,
                      borderWidth: 2,
                      borderBottomWidth: 4,
                    }}
                    className="bg-cartao rounded-2xl px-3.5 py-3.5 mb-3 flex-row items-center"
                  >
                    <View
                      style={{
                        borderColor: correta ? "#4FA3A5" : errada ? "#E25C5C" : marcada ? cor : cores.bordaForte,
                        backgroundColor: marcada || correta ? (correta ? "#4FA3A5" : errada ? "#E25C5C" : cor) : "transparent",
                      }}
                      className="w-8 h-8 rounded-lg border-2 items-center justify-center mr-3"
                    >
                      <Text className={`text-sm font-extrabold ${marcada || correta ? "text-white" : "text-texto-suave"}`}>
                        {String.fromCharCode(65 + i)}
                      </Text>
                    </View>
                    <Text className="flex-1 text-base text-texto font-semibold">{texto}</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Rodapé: feedback e botão */}
        <View
          className={`px-6 pt-5 pb-6 ${resposta ? (resposta.acertou ? "bg-agua" : "bg-vermelho") : ""}`}
          style={resposta ? { borderTopLeftRadius: 24, borderTopRightRadius: 24 } : undefined}
        >
          {resposta && (
            <View className="mb-4">
              <View className="flex-row items-center">
                <Ionicons
                  name={resposta.acertou ? "checkmark-circle" : "information-circle"}
                  size={22}
                  color={resposta.acertou ? "#4FA3A5" : "#E25C5C"}
                />
                <Text style={{ color: resposta.acertou ? "#4FA3A5" : "#E25C5C" }} className="text-lg font-extrabold ml-2">
                  {conteudo.tipo === "situacao"
                    ? "Obrigada por participar!"
                    : resposta.acertou
                      ? "Isso mesmo!"
                      : `Resposta: ${pergunta!.alternativas[pergunta!.correta]}`}
                  {resposta.ganhou ? "  +10" : ""}
                </Text>
              </View>
              <Text className="text-sm text-texto-2 mt-2">
                {conteudo.tipo === "situacao" ? conteudo.escolhas[resposta.escolha].retorno : pergunta!.explicacao}
              </Text>
            </View>
          )}
          {conteudo.tipo === "explicacao" ? (
            <Botao texto="Continuar" cor={cor} onPress={continuarExplicacao} />
          ) : resposta ? (
            <Botao texto="Continuar" cor={resposta.acertou ? "#4FA3A5" : "#E25C5C"} onPress={avancar} />
          ) : (
            <Botao texto="Verificar" cor={cor} desativado={escolha === null} onPress={verificar} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function Botao({ texto, cor, onPress, desativado }: { texto: string; cor: string; onPress: () => void; desativado?: boolean }) {
  const cores = useCores();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={desativado}
      activeOpacity={0.9}
      style={{ backgroundColor: desativado ? cores.bordaForte : cor, borderBottomWidth: 4, borderColor: "rgba(0,0,0,0.18)" }}
      className="rounded-2xl py-4 items-center"
    >
      <Text className="text-white font-extrabold text-base uppercase tracking-wider">{texto}</Text>
    </TouchableOpacity>
  );
}

function Resumo({ icone, cor, valor, rotulo }: { icone: string; cor: string; valor: string; rotulo: string }) {
  return (
    <View style={{ borderColor: cor }} className="flex-1 mx-1.5 rounded-2xl border-2 overflow-hidden">
      <View style={{ backgroundColor: cor }} className="py-1 items-center">
        <Text className="text-white text-[11px] font-extrabold uppercase tracking-wider">{rotulo}</Text>
      </View>
      <View className="flex-row items-center justify-center py-3 bg-cartao">
        <MaterialCommunityIcons name={icone as any} size={20} color={cor} />
        <Text style={{ color: cor }} className="text-xl font-extrabold ml-1.5">
          {valor}
        </Text>
      </View>
    </View>
  );
}

// Três estrelinhas que surgem uma após a outra sobre o troféu
function Estrelas({ cor }: { cor: string }) {
  const escalas = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(
      150,
      escalas.map((e) => Animated.spring(e, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== "web" })),
    ).start();
  }, []);
  return (
    <View className="flex-row items-end mb-3">
      {escalas.map((e, i) => (
        <Animated.View key={i} style={{ transform: [{ scale: e }], marginHorizontal: 6, marginBottom: i === 1 ? 10 : 0 }}>
          <MaterialCommunityIcons name="star-four-points" size={i === 1 ? 30 : 22} color={i === 1 ? "#F5B301" : cor} />
        </Animated.View>
      ))}
    </View>
  );
}
