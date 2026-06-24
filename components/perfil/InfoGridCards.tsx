import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { ProfileStats } from "../../types/profile";

export function InfoGridCards({
  currentWeek,
  readArticles,
  doneQuizzes,
  streakDays,
}: ProfileStats) {
  const cards = [
    {
      value: `${currentWeek}`,
      label: "Semana Atual",
      icon: (
        <MaterialCommunityIcons
          name="face-woman-outline"
          size={16}
          color="#D97D54"
        />
      ),
      bg: "bg-[#FDF2EE]",
    },
    {
      value: `${readArticles}`,
      label: "Artigos Lidos",
      icon: <Ionicons name="book-outline" size={16} color="#6366F1" />,
      bg: "bg-[#EEF2FF]",
    },
    {
      value: `${doneQuizzes}`,
      label: "Quizzes Feitos",
      icon: <MaterialCommunityIcons name="target" size={16} color="#E25C5C" />,
      bg: "bg-[#FDF0F0]",
    },
    {
      value: `${streakDays}d`,
      label: "Sequência",
      icon: <MaterialCommunityIcons name="fire" size={16} color="#FF9F43" />,
      bg: "bg-[#FFF5EC]",
    },
  ];

  return (
    <View className="flex-row justify-between w-full mt-4 flex-wrap">
      {cards.map((card, i) => (
        <View
          key={i}
          className="w-[23%] bg-white border border-[#F0EBE6] rounded-2xl p-3 items-center justify-center"
        >
          <View className={`${card.bg} p-2 rounded-xl mb-1.5`}>
            {card.icon}
          </View>
          <Text className="text-base font-extrabold text-gray-800 tracking-tight">
            {card.value}
          </Text>
          <Text
            className="text-[9px] text-gray-400 font-bold text-center mt-0.5"
            numberOfLines={1}
          >
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
