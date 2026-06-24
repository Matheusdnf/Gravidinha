import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes Modulares da Arquitetura
import { InfoGridCards } from "../../components/perfil/InfoGridCards";
import { JourneyTimeline } from "../../components/perfil/JourneyTimeline";
import { ProfileMenuOptions } from "../../components/perfil/ProfileMenuOptions";

// Mocks Isolados
import { mockMenuOptions, mockProfileStats } from "../../state/mockProfileData";

export default function PerfilScreen() {
  // Conquistas rápidas para a fileira horizontal
  const recentBadges = [
    { id: "1", label: "Início", emoji: "🌱", bg: "bg-[#FDF2EE]" },
    { id: "2", label: "Quiz Master", emoji: "🎯", bg: "bg-[#FDF0F0]" },
    { id: "3", label: "Leitora", emoji: "📘", bg: "bg-[#EEF2FF]" },
    { id: "4", label: "1° Tri", emoji: "🌸", bg: "bg-[#FDF2F8]" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* 1. TOPO: Bloco com Avatar, Nome e Conteúdo Offline */}
        <View className="flex-row items-center w-full">
          {/* Simulação do avatar colorido da imagem */}
          <View className="w-16 h-16 rounded-full bg-[#D97D54]/80 items-center justify-center border-2 border-white shadow-sm overflow-hidden">
            <Text className="text-3xl pt-1">👩‍🍼</Text>
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-xl font-extrabold text-gray-900 tracking-tight">
              Ana Clara
            </Text>
            <Text className="text-xs text-gray-400 font-medium">
              ana.clara@email.com
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 rounded-full bg-[#4FA3A5]" />
              <Text className="text-[11px] text-[#4FA3A5] font-bold ml-1.5">
                Conteúdo offline atualizado
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Os 4 Bento Cards (Estatísticas rápidas) */}
        <InfoGridCards {...mockProfileStats} />

        {/* 3. Card de Linha do Tempo / Régua */}
        <JourneyTimeline />

        {/* 4. SEÇÃO: Conquistas Recentes */}
        <View className="w-full mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-gray-800">
              Conquistas Recentes
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-xs font-bold text-[#D97D54]">
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fileira de Conquistas Redondas */}
          <View className="flex-row justify-between items-center w-full bg-white border border-[#F5F2EE] rounded-3xl p-4">
            {recentBadges.map((badge) => (
              <View
                key={badge.id}
                className="items-center justify-center flex-1"
              >
                <View
                  className={`${badge.bg} w-11 h-11 rounded-full items-center justify-center border border-white`}
                >
                  <Text className="text-lg">{badge.emoji}</Text>
                </View>
                <Text
                  className="text-[10px] text-gray-400 font-bold mt-2"
                  numberOfLines={1}
                >
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5. SEÇÃO: Menu de Opções */}
        <Text className="text-xs font-extrabold text-gray-400 tracking-wider uppercase mb-2">
          Minha Gestação
        </Text>
        <View className="bg-white border border-[#F0EBE6] rounded-[28px] px-5 py-2 w-full">
          {mockMenuOptions.map((option) => (
            <ProfileMenuOptions
              key={option.id}
              id={option.id}
              title={option.title}
              subtitle={option.subtitle}
              iconName={option.iconName}
              iconColor={option.iconColor}
              bgColor={option.bgColor}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
