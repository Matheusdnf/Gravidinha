import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { ContentArticle } from "../../types/dashboard";

export function ContentCard({
  tag,
  title,
  description,
  readingTime,
  imageUrl,
}: ContentArticle) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mr-4 overflow-hidden border border-[#F5F5F5]"
      style={{ width: Dimensions.get("window").width * 0.65 }}
      activeOpacity={0.9}
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
      <View className="p-3.5">
        <Text className="text-sm font-bold text-[#333] mb-1" numberOfLines={2}>
          {title}
        </Text>
        <Text className="text-xs text-[#777] leading-4 mb-2" numberOfLines={2}>
          {description}
        </Text>
        <Text className="text-[11px] text-[#D97D54] font-semibold">
          {readingTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
