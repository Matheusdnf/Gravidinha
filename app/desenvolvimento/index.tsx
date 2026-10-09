import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../state/auth";
import { buscarDesenvolvimento } from "../../lib/dados";
import { imagensSemanas } from "../../constants/imagesSemanas";

export default function DesenvolvimentoScreen() {
  const router = useRouter();
  const { semana, id_gestacao } = useLocalSearchParams();
  const { user, selectedGestacao } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Prioriza id_gestacao do parâmetro; usa selectedGestacao como fallback
    const gestacaoId = id_gestacao || selectedGestacao?.id_gestacao;

    // Semana específica passada pela lista; senão a semana atual da gestação (ou da ativa, sem id)
    buscarDesenvolvimento(semana ? Number(semana) : undefined, gestacaoId ? String(gestacaoId) : undefined)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id, semana, id_gestacao, selectedGestacao?.id_gestacao]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FBF9F6] justify-center items-center">
        <ActivityIndicator size="large" color="#C56A43" />
      </SafeAreaView>
    );
  }

  if (!data || !data.dados) {
    return (
      <SafeAreaView className="flex-1 bg-[#FBF9F6] justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#C56A43" />
        <Text className="text-lg text-center font-bold text-[#2C221E] mb-2 mt-4">
          Não foi possível carregar os dados
        </Text>
        <Text className="text-sm text-center text-[#8A7A75] mb-6">
          Verifique se você possui uma gestação ativa e com a data de início correta.
        </Text>
        <TouchableOpacity
          className="bg-[#C56A43] py-3 px-6 rounded-full"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        >
          <Text className="text-white font-bold">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { dados, semana_atual } = data;

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-[#F0EBE6] bg-white">
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#2C221E" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#2C221E]">
          Sua {semana_atual}ª Semana
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header com Quadrado Central */}
        <View className="items-center pt-8 pb-6 px-6">
          <View className="bg-[#FDF2EE] px-4 py-1.5 rounded-full mb-4 flex-row items-center">
            <Ionicons name="calendar" size={14} color="#C56A43" />
            <Text className="text-[#C56A43] text-sm font-bold ml-2">Semana {semana_atual}</Text>
          </View>

          {/* Quadrado Exibindo a Imagem */}
          <View className="w-48 h-48 rounded-[32px] bg-[#FADCD0] overflow-hidden shadow-sm mb-6 border-4 border-white items-center justify-center">
            {imagensSemanas[semana_atual] && (
              <Image
                source={imagensSemanas[semana_atual]}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            )}
          </View>

          <Text className="text-2xl font-extrabold text-[#2C221E] text-center leading-tight">
            Tamanho de {dados.comparacao}
          </Text>
          <Text className="text-[#8A7A75] font-medium mt-2 text-center">
            Aproximadamente {dados.tamanho_aproximado}
          </Text>
        </View>

        <View className="px-5 mt-6">
          {/* O Bebê */}
          <View className="mb-6 bg-white p-5 rounded-[24px] border border-[#F0EBE6] shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-[#FDF2EE] items-center justify-center mr-3">
                <Ionicons name="egg-outline" size={18} color="#C56A43" />
              </View>
              <Text className="text-lg font-bold text-[#2C221E]">O Bebê</Text>
            </View>
            <Text className="text-[15px] text-[#5C4F4A] leading-relaxed">
              {dados.descricao_visual}
            </Text>
          </View>

          {/* O Corpo */}
          <View className="mb-6 bg-white p-5 rounded-[24px] border border-[#F0EBE6] shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-[#EEF7F7] items-center justify-center mr-3">
                <Ionicons name="body-outline" size={18} color="#4FA3A5" />
              </View>
              <Text className="text-lg font-bold text-[#2C221E]">Seu Corpo</Text>
            </View>
            <Text className="text-[15px] text-[#5C4F4A] leading-relaxed">
              {dados.descricao_corpo}
            </Text>
          </View>

          {/* Sintomas Físicos */}
          {dados.sintomas_fisicos && dados.sintomas_fisicos.length > 0 && (
            <View className="mb-6 bg-white p-5 rounded-[24px] border border-[#F0EBE6] shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-[#F3E5F5] items-center justify-center mr-3">
                  <Ionicons name="medical-outline" size={18} color="#9C27B0" />
                </View>
                <Text className="text-lg font-bold text-[#2C221E]">Sintomas Físicos Comuns</Text>
              </View>
              {dados.sintomas_fisicos.map((sintoma: string, idx: number) => (
                <View key={idx} className="flex-row items-start mb-3 last:mb-0">
                  <View className="w-1.5 h-1.5 rounded-full bg-[#9C27B0] mt-2 mr-3" />
                  <Text className="text-[15px] text-[#5C4F4A] flex-1 leading-relaxed">
                    {sintoma}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Sintomas Emocionais */}
          {dados.sintomas_emocionais && dados.sintomas_emocionais.length > 0 && (
            <View className="mb-6 bg-white p-5 rounded-[24px] border border-[#F0EBE6] shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-[#F4FCE3] items-center justify-center mr-3">
                  <Ionicons name="heart-outline" size={18} color="#84CC16" />
                </View>
                <Text className="text-lg font-bold text-[#2C221E]">O que você pode sentir</Text>
              </View>
              {dados.sintomas_emocionais.map((sintoma: string, idx: number) => (
                <View key={idx} className="flex-row items-start mb-3 last:mb-0">
                  <View className="w-1.5 h-1.5 rounded-full bg-[#84CC16] mt-2 mr-3" />
                  <Text className="text-[15px] text-[#5C4F4A] flex-1 leading-relaxed">
                    {sintoma}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
