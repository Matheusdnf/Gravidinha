import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickAccessButtonProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
}

export function QuickAccessButton({
  title,
  subtitle,
  icon,
  bgColor,
}: QuickAccessButtonProps) {
  return (
    <TouchableOpacity
      // items-start inserido e p-5 ajustado para dar simetria perfeita com os Bento Cards do perfil
      className={`${bgColor} flex-1 min-w-[47%] rounded-3xl p-5 mb-3 border border-[#F0EBE6]/30`}
      activeOpacity={0.8}
    >
      <View className="mb-3">{icon}</View>
      <Text className="text-[15px] font-bold text-gray-800">{title}</Text>
      <Text className="text-xs text-gray-400 mt-0.5 font-medium">
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}
