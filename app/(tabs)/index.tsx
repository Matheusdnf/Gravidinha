import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes Modulares ajustados para o diretório padrão
import { ContentCard } from "../../components/inicio/ContentCard";
import { JourneyCard } from "../../components/inicio/JourneyCard";
import { QuickAccessButton } from "../../components/inicio/QuickAccessButton";

// Estado de dados Isolado
import {
  mockBlocksData,
  mockPregnancyData,
} from "../../state/mockDashboardData";

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center">
      {/* Wrapper restrito para simular perfeitamente o tamanho de app na Web */}
      <View className="w-full max-w-xl flex-1 px-5">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        >
          {/* Card Principal Terracota (Configurado sem boxShadow em JS) */}
          <JourneyCard
            currentWeek={mockPregnancyData.currentWeek}
            totalWeeks={mockPregnancyData.totalWeeks}
            trimester={mockPregnancyData.trimester}
            progressPercentage={mockPregnancyData.progressPercentage}
            offlineSaved={mockPregnancyData.offlineSaved}
          />

          {/* Cabeçalho da Seção de Carrossel */}
          <View className="flex-row justify-between items-center mt-6 mb-3 w-full">
            <View>
              <Text className="text-xl font-bold text-[#222]">
                Novo Bloco Disponível
              </Text>
              <Text className="text-xs text-[#888] mt-0.5">
                Semanas 10–12 · 3 itens
              </Text>
            </View>
            <View className="flex-row items-center bg-[#EAEAEA] px-2.5 py-1 rounded-full">
              <Ionicons name="cloud-offline-outline" size={12} color="#666" />
              <Text className="text-[11px] color-[#666] font-medium ml-1">
                Offline
              </Text>
            </View>
          </View>

          {/* Carrossel de Mídias (FlatList) Ajustado para Scroll Perfeito */}
          <FlatList
            data={mockBlocksData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContentCard
                id={item.id}
                tag={item.tag}
                title={item.title}
                description={item.description}
                readingTime={item.readingTime}
                imageUrl={item.imageUrl}
              />
            )}
            // Propriedades essenciais de comportamento do Tailwind para Web e Mobile
            className="w-full"
            contentContainerStyle={{
              paddingRight: 20, // Garante folga segura no final da rolagem horizontal
              paddingBottom: 8,
            }}
          />

          {/* Banner Informativo: Próxima Semana */}
          <View className="flex-row items-center bg-white rounded-3xl p-4 my-5 border border-[#F0F0F0] w-full">
            <View className="bg-[#FDF2EE] p-2.5 rounded-xl">
              <Ionicons name="sparkles" size={18} color="#D97D54" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-[#333]">
                Próximo bloco na Semana 13
              </Text>
              <Text className="text-xs text-[#888] mt-0.5">
                Novos artigos e vídeos em breve
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>

          {/* Seção de Acesso Rápido */}
          <Text className="text-lg font-bold text-[#222] mb-3 w-full">
            Acesso Rápido
          </Text>

          <View className="flex-row justify-between items-start w-full">
            <QuickAccessButton
              title="Quiz Semanal"
              subtitle="Semana 12 disponível"
              bgColor="bg-[#FDF2EE]"
              icon={
                <MaterialCommunityIcons
                  name="target"
                  size={24}
                  color="#E25C5C"
                />
              }
            />
            <QuickAccessButton
              title="Meu Diário"
              subtitle="Registrar hoje"
              bgColor="bg-[#EEF7F7]"
              icon={
                <MaterialCommunityIcons
                  name="notebook-outline"
                  size={24}
                  color="#4FA3A5"
                />
              }
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
