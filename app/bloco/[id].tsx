import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockBlocksData } from "../../state/mockDashboardData";

export default function DetalhesBlocoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Busca na lista de 3 blocos qual deles bate com o id clicado
  const blocoInfo = mockBlocksData.find((item) => item.id === id);

  if (!blocoInfo) {
    return (
      <SafeAreaView className="flex-1 bg-[#FBF9F6] justify-center items-center">
        <Text className="text-gray-400">Conteúdo não encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center">
      <View className="w-full max-w-xl flex-1">
        {/* Barra de Topo Dinâmica */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={22} color="#333" />
          </TouchableOpacity>

          {/* AQUI ESTÁ A MÁGICA: Renderiza o título real do bloco clicado! */}
          <Text
            className="text-sm font-extrabold text-gray-800 flex-1 text-center mx-4"
            numberOfLines={1}
          >
            {blocoInfo.title}
          </Text>

          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4">
          {/* Imagem de Destaque */}
          <Image
            source={{ uri: blocoInfo.imageUrl }}
            className="w-full h-52 bg-gray-200 rounded-3xl mb-5"
          />

          {/* Categoria/Tag e Tempo */}
          <View className="flex-row items-center mb-3">
            <View className="bg-[#FDF2EE] px-3 py-1 rounded-full">
              <Text className="text-[#D97D54] text-xs font-bold">
                {blocoInfo.tag}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 font-medium ml-3">
              Tempo: {blocoInfo.readingTime}
            </Text>
          </View>

          {/* Título Principal no corpo da página */}
          <Text className="text-2xl font-extrabold text-gray-900 leading-tight">
            {blocoInfo.title}
          </Text>

          <View className="h-[1px] bg-gray-200/60 my-4 w-full" />

          {/* Conteúdo Dinâmico */}
          <Text className="text-base font-bold text-gray-800 mb-2">
            Introdução ao Conteúdo
          </Text>

          <Text className="text-sm text-gray-600 leading-relaxed mb-4">
            {blocoInfo.description} Esse artigo foi preparado especialmente para
            a sua fase atual da gestação. Ler materiais selecionados e focar na
            sua rotina diária ajuda a construir uma jornada mais tranquila.
          </Text>

          <Text className="text-base font-bold text-gray-800 mb-2">
            Modo de Acesso
          </Text>

          <Text className="text-sm text-gray-600 leading-relaxed mb-6">
            Este conteúdo faz parte do banco de dados offline do aplicativo.
            Você pode revisitar esse artigo, fazer o quiz associado e monitorar
            as tarefas semanais a qualquer hora, mesmo sem internet.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
