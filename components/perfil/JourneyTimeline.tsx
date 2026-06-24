import { Text, View } from "react-native";

export function JourneyTimeline() {
  return (
    <View className="bg-white border border-[#F0EBE6] rounded-3xl p-5 my-5 w-full">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-bold text-gray-800">
          Jornada das 45 Semanas
        </Text>
        <Text className="text-xs font-bold text-[#D97D54]">27% completa</Text>
      </View>

      {/* Régua / Barra de Progresso */}
      <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
        <View
          className="h-full bg-[#D97D54] rounded-full"
          style={{ width: "27%" }}
        />
      </View>

      {/* Indicadores de Texto Abaixo da Barra */}
      <View className="flex-row justify-between items-center w-full">
        <Text className="text-[10px] text-gray-400 font-bold">Semana 1</Text>
        <Text className="text-[10px] text-[#D97D54] font-extrabold bg-[#FDF2EE] px-2 py-0.5 rounded-md">
          Semana 12 ← você está aqui
        </Text>
        <Text className="text-[10px] text-gray-400 font-bold">Semana 45</Text>
      </View>
    </View>
  );
}
