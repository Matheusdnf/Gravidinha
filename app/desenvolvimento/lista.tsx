import { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../state/auth";
import { listarGestacoes, listarSemanas } from "../../lib/dados";
import { useDadosAtualizados } from "../../lib/sync";
import { BottomSheetModal } from "../../components/BottomSheetModal";
import { useCores } from "../../lib/tema";

export default function DesenvolvimentoListaScreen() {
  const cores = useCores();
  const router = useRouter();
  const { user, selectedGestacao, setSelectedGestacao } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gestacoes, setGestacoes] = useState<any[]>([]);
  const [seletorVisible, setSeletorVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Busca todas as gestações do usuário para o seletor
  const carregarGestacoes = () => {
    if (user?.id) {
      listarGestacoes()
        .then(setGestacoes)
        .catch(console.error);
    }
  };
  useEffect(carregarGestacoes, [user?.id]);
  useDadosAtualizados(carregarGestacoes);

  // Busca o desenvolvimento da gestação selecionada
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setData(null);

    let scrollTimer: ReturnType<typeof setTimeout>;
    // Sem gestação selecionada, usa a ativa da usuária
    listarSemanas(selectedGestacao?.id_gestacao)
      .then(json => {
        setData(json);
        // Rola até a semana atual
        scrollTimer = setTimeout(() => {
          if (scrollViewRef.current && json.semana_atual) {
            const yPos = Math.max(0, (json.semana_atual - 2) * 110);
            scrollViewRef.current.scrollTo({ y: yPos, animated: true });
          }
        }, 500);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => clearTimeout(scrollTimer);
  }, [user?.id, selectedGestacao?.id_gestacao]);

  const nomeGestacaoAtual = selectedGestacao?.nome || "Minha Gestação";
  const isFinalizada = selectedGestacao?.status === 'finalizada';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-fundo justify-center items-center">
        <ActivityIndicator size="large" color="#C56A43" />
      </SafeAreaView>
    );
  }

  if (!data || !data.lista) {
    return (
      <SafeAreaView className="flex-1 bg-fundo justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#C56A43" />
        <Text className="text-lg text-center font-bold text-texto mb-2 mt-4">
          Não foi possível carregar as semanas
        </Text>
        <TouchableOpacity
          className="bg-[#C56A43] py-3 px-6 rounded-full mt-4"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        >
          <Text className="text-white font-bold">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { lista, semana_atual } = data;

  return (
    <SafeAreaView className="flex-1 bg-fundo">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-borda bg-cartao">
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color={cores.texto} />
        </TouchableOpacity>

        {/* Nome da gestação — toca para abrir seletor */}
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          activeOpacity={gestacoes.length > 1 ? 0.7 : 1}
          onPress={() => gestacoes.length > 1 && setSeletorVisible(true)}
        >
          <View className="flex-1">
            <Text className="text-base font-extrabold text-texto" numberOfLines={1}>
              {nomeGestacaoAtual}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-xs text-texto-suave">
                {isFinalizada ? "Finalizada na" : "Semana atual:"}{" "}
                <Text className="font-bold text-[#C56A43]">{semana_atual}</Text>
              </Text>
              {isFinalizada && (
                <View className="ml-2 bg-pessego px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-[#C56A43] uppercase">Finalizada</Text>
                </View>
              )}
            </View>
          </View>
          {gestacoes.length > 1 && (
            <MaterialCommunityIcons name="chevron-down" size={20} color={cores.textoSuave} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {isFinalizada ? (
          <View className="bg-pessego border border-pessego-borda rounded-2xl p-4 mb-5 flex-row items-center">
            <MaterialCommunityIcons name="baby-face-outline" size={24} color="#C56A43" />
            <Text className="text-sm text-[#C56A43] font-medium ml-3 flex-1 leading-relaxed">
              Esta gestação foi finalizada na semana {semana_atual}. Você pode rever toda a jornada!
            </Text>
          </View>
        ) : (
          <Text className="text-texto-suave text-sm mb-6 text-center">
            Reviva as semanas que passaram e acompanhe seu progresso!
          </Text>
        )}

        {lista.map((item: any) => {
          const isCurrent = item.semana === semana_atual;

          return (
            <TouchableOpacity
              key={item.semana}
              activeOpacity={0.8}
              disabled={item.bloqueada}
              onPress={() => {
                if (!item.bloqueada) {
                  router.push(`/desenvolvimento?semana=${item.semana}&id_gestacao=${selectedGestacao?.id_gestacao || ''}`);
                }
              }}
              className={`flex-row items-center p-4 mb-4 rounded-2xl border 
                ${isCurrent ? 'bg-pessego border-pessego-borda' : item.bloqueada ? 'bg-cartao border-borda opacity-60' : 'bg-cartao border-borda-forte'}
              `}
            >
              <View className={`w-14 h-14 rounded-xl items-center justify-center mr-4 
                ${isCurrent ? 'bg-[#C56A43]' : item.bloqueada ? 'bg-borda' : 'bg-[#E2B19C]'}
              `}>
                {item.bloqueada ? (
                  <Ionicons name="lock-closed" size={20} color={cores.textoFraco} />
                ) : (
                  <Text className="text-white font-bold text-lg">{item.semana}</Text>
                )}
              </View>

              <View className="flex-1">
                <Text className={`font-bold text-base mb-1
                  ${isCurrent ? 'text-[#C56A43]' : item.bloqueada ? 'text-texto-suave' : 'text-texto'}
                `}>
                  Semana {item.semana}{isCurrent && (isFinalizada ? ' (Final)' : ' (Atual)')}
                </Text>

                {!item.bloqueada ? (
                  <Text className="text-sm text-texto-suave">
                    Tamanho de {item.comparacao}
                  </Text>
                ) : (
                  <Text className="text-sm text-texto-fraco">
                    Conteúdo ainda indisponível
                  </Text>
                )}
              </View>

              {!item.bloqueada && (
                <Ionicons name="chevron-forward" size={20} color={isCurrent ? "#C56A43" : "#C2B2AC"} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Seletor de Gestação */}
      {gestacoes.length > 1 && (
        <BottomSheetModal
          visible={seletorVisible}
          onClose={() => setSeletorVisible(false)}
          title="Selecionar Gestação"
        >
          <View className="pb-6 px-1">
            {gestacoes.map((g, idx) => {
              const isSelected = selectedGestacao?.id_gestacao === g.id_gestacao;
              return (
                <TouchableOpacity
                  key={g.id_gestacao || idx}
                  onPress={() => {
                    setSelectedGestacao(g);
                    setSeletorVisible(false);
                  }}
                  className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${
                    isSelected ? 'bg-pessego border-pessego-borda' : 'bg-cartao border-borda'
                  }`}
                >
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${isSelected ? 'text-[#C56A43]' : 'text-texto'}`}>
                      {g.nome || `Gestação ${idx + 1}`}
                    </Text>
                    {g.status === 'finalizada' && (
                      <Text className="text-xs text-texto-suave mt-0.5">Finalizada</Text>
                    )}
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={20} color="#C56A43" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetModal>
      )}
    </SafeAreaView>
  );
}
