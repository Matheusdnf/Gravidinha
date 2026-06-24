import { FontAwesome5 } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface StreakCardProps {
  days: number;
}

export function StreakCard({ days }: StreakCardProps) {
  return (
    <View className="bg-white border border-[#F0EBE6] rounded-3xl p-4 flex-row items-center justify-between w-full">
      <View className="flex-row items-center flex-1">
        <View className="bg-[#FDF2EE] p-3 rounded-2xl">
          <FontAwesome5 name="fire" size={20} color="#D97D54" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-base font-bold text-gray-800">
            {days} dias seguidos! 🔥
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            Continue para ganhar o emblema de 7 dias
          </Text>
        </View>
      </View>
      <View className="items-center justify-center px-2">
        <Text className="text-2xl font-extrabold text-[#D97D54] tracking-tight">
          {days}
        </Text>
        <Text className="text-[10px] text-gray-400 font-medium">dias</Text>
      </View>
    </View>
  );
}
