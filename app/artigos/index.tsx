import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { mockBlocksData } from '../../state/mockDashboardData';
import { ContentArticle } from '../../types/dashboard';

export default function ArtigosScreen() {
  const router = useRouter();

  const artigos = mockBlocksData;

  // Agrupa os artigos por 'tag' (Ex: Nutrição, Exercício, Mental, Alongamento)
  const artigosPorTema = artigos.reduce((acc, artigo) => {
    if (!acc[artigo.tag]) acc[artigo.tag] = [];
    acc[artigo.tag].push(artigo);
    return acc;
  }, {} as Record<string, ContentArticle[]>);

  const temas = Object.keys(artigosPorTema);

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-[#F0EBE6] bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="#2C221E" />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-[#2C221E]">Biblioteca Temática</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} className="flex-1">
        <View className="px-5 py-6">
          <Text className="text-base text-[#8A7A75] mb-6">
            Navegue pelos temas e descubra conteúdos preparados especialmente para a sua gestação.
          </Text>

          {temas.map(tema => (
            <View key={tema} className="mb-8">
              {/* Título do Tema */}
              <View className="flex-row items-center mb-4">
                <View className="w-1.5 h-6 bg-[#C56A43] rounded-full mr-3" />
                <Text className="text-xl font-bold text-[#2C221E] capitalize">{tema}</Text>
              </View>

              {/* Lista horizontal dos artigos daquele tema */}
              <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                {artigosPorTema[tema].map(artigo => (
                  <TouchableOpacity 
                    key={artigo.id}
                    className="w-64 bg-white rounded-3xl mr-4 overflow-hidden border border-[#F0EBE6] shadow-sm mb-2"
                    activeOpacity={0.9}
                    onPress={() => router.push(`/bloco/${artigo.id}`)}
                  >
                    <Image source={{ uri: artigo.imageUrl }} className="w-full h-32 bg-[#F5F5F5]" resizeMode="cover" />
                    <View className="p-4">
                      <Text className="text-sm font-bold text-[#2C221E] mb-1" numberOfLines={2}>{artigo.title}</Text>
                      <Text className="text-xs text-[#8A7A75] leading-relaxed mb-3" numberOfLines={2}>{artigo.description}</Text>
                      
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[10px] font-bold text-[#C56A43] uppercase tracking-wider">{artigo.readingTime}</Text>
                        <Ionicons name="arrow-forward-circle" size={20} color="#D97D54" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
