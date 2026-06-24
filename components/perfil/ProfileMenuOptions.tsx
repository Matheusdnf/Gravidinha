import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { ProfileMenuOption } from "../../types/profile";

export function ProfileMenuOptions({
  title,
  subtitle,
  iconName,
  iconColor,
  bgColor,
}: ProfileMenuOption) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 border-b border-gray-50/70 w-full"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className={`${bgColor} p-2.5 rounded-xl`}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={20}
            color={iconColor}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm font-bold text-gray-800">{title}</Text>
          <Text className="text-xs text-gray-400 mt-0.5 font-medium">
            {subtitle}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CCC" />
    </TouchableOpacity>
  );
}
