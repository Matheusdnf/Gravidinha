import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrimesterAccordion } from "../../components/jornadas/TrimesterAccordion";
import { mockJourneyData } from "../../state/mockJourneyData";

export default function JornadaScreen() {
  const categories = [
    "1° Trimestre",
    "2° Trimestre",
    "3° Trimestre",
    "Pós-parto",
  ];
  const activeCategory = "1° Trimestre";

  return (
    // Mudamos de "items-center" para uma estrutura de flex pira com background limpo
    <SafeAreaView className="flex-1 bg-[#FBF9F6]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24, // Margem nas laterais idêntica ao design da imagem
          paddingTop: 24,
          paddingBottom: 40,
        }}
        className="w-full max-w-2xl mx-auto" // Centraliza perfeitamente o bloco inteiro no navegador
      >
        {/* Cabeçalho da Página */}
        <Text className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Jornada das 45 Semanas
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Acompanhe cada etapa da sua gravidez ao pós-parto
        </Text>

        {/* Filtros Horizontais */}
        <View className="flex-row items-center justify-between mt-6 border-b border-gray-200/60 pb-3 w-full">
          {categories.map((cat) => (
            <TouchableOpacity key={cat} activeOpacity={0.7}>
              <Text
                className={`text-xs font-bold tracking-wide ${
                  cat === activeCategory ? "text-[#D97D54]" : "text-gray-400"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Barra de Progresso Geral */}
        <View className="mt-5 mb-6 w-full">
          <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-[#D97D54] rounded-full"
              style={{ width: "27%" }}
            />
          </View>
          <Text className="text-[11px] text-gray-400 font-bold mt-2">
            Semana 12 de 45 · 27% concluída
          </Text>
        </View>

        {/* Listagem dos Blocos (Accordions) */}
        <View className="w-full mt-2">
          {mockJourneyData.map((block) => (
            <TrimesterAccordion
              key={block.id}
              id={block.id}
              title={block.title}
              weeksRange={block.weeksRange}
              description={block.description}
              iconName={block.iconName}
              isLocked={block.isLocked}
              tasks={block.tasks}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
