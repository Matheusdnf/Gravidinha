import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes Modulares
import { ContentCard } from "../../components/dashboard/ContentCard";
import { JourneyCard } from "../../components/dashboard/JourneyCard";
import { QuickAccessButton } from "../../components/dashboard/QuickAccessButton";

// Estado de dados Isolado
import {
  mockBlocksData,
  mockPregnancyData,
} from "../../state/mockDashboardData";

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        {/* Card Principal Terracota */}
        <JourneyCard
          currentWeek={mockPregnancyData.currentWeek}
          totalWeeks={mockPregnancyData.totalWeeks}
          trimester={mockPregnancyData.trimester}
          progressPercentage={mockPregnancyData.progressPercentage}
          offlineSaved={mockPregnancyData.offlineSaved}
        />

        {/* Cabeçalho da Seção de Carrossel */}
        <View className="flex-row justify-between items-center mt-4 mb-3">
          <View>
            <Text className="text-lg font-bold text-[#222]">
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

        {/* Carrossel de Mídias (FlatList) */}
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
          className="pb-2"
        />

        {/* Banner Avançado: Próxima Semana */}
        <View className="flex-row items-center bg-white rounded-2xl p-4 my-4 border border-[#F0F0F0]">
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

        {/* Seção de Conquistas e Diário */}
        <Text className="text-lg font-bold text-[#222] mb-3">
          Acesso Rápido
        </Text>

        <View className="flex-row justify-between">
          <QuickAccessButton
            title="Quiz Semanal"
            subtitle="Semana 12 disponível"
            bgColor="bg-[#FDF2EE]"
            icon={
              <MaterialCommunityIcons name="target" size={24} color="#E25C5C" />
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
    </SafeAreaView>
  );
}
