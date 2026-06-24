import { useRouter } from "expo-router"; // Importamos o router
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { ContentArticle } from "../../types/dashboard";

export function ContentCard({
  id,
  tag,
  title,
  description,
  readingTime,
  imageUrl,
}: ContentArticle) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl mr-4 overflow-hidden border border-[#F0EBE6]"
      style={{ width: Dimensions.get("window").width * 0.65 }}
      activeOpacity={0.9}
      // Redireciona para a pasta bloco enviando o ID único do item
      onPress={() => router.push(`/bloco/${id}`)}
    >
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-[120px] bg-[#EEE]"
        />
        <View className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-md">
          <Text className="text-[#D97D54] text-[11px] font-bold">{tag}</Text>
        </View>
      </View>
      <View className="p-4">
        <Text className="text-sm font-bold text-[#333] mb-1" numberOfLines={2}>
          {title}
        </Text>
        <Text
          className="text-xs text-[#777] leading-relaxed mb-2.5"
          numberOfLines={2}
        >
          {description}
        </Text>
        <Text className="text-[11px] text-[#D97D54] font-semibold">
          {readingTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
