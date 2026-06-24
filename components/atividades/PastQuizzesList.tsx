import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { QuizHistoryItem } from "../../types/engagement";

export function PastQuizzesList({ weekTitle, date, score }: QuizHistoryItem) {
  return (
    <View className="bg-white border border-[#F5F2EE] rounded-2xl p-4 flex-row items-center justify-between mb-3 w-full">
      <View className="flex-row items-center">
        <View className="bg-[#EEF6F6] w-9 h-9 rounded-full items-center justify-center">
          <Ionicons name="checkmark-circle-outline" size={18} color="#4FA3A5" />
        </View>
        <View className="ml-3">
          <Text className="text-sm font-bold text-gray-800">{weekTitle}</Text>
          <Text className="text-[11px] text-gray-400 mt-0.5">{date}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-sm font-extrabold text-[#4FA3A5]">{score}</Text>
        <Text className="text-[10px] text-gray-400 font-medium">acertos</Text>
      </View>
    </View>
  );
}
