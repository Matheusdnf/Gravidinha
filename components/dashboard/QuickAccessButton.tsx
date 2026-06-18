import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickAccessButtonProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string; // Ex: "bg-[#FDF2EE]"
}

export function QuickAccessButton({
  title,
  subtitle,
  icon,
  bgColor,
}: QuickAccessButtonProps) {
  return (
    <TouchableOpacity
      className={`${bgColor} flex-1 min-w-[46%] rounded-2xl p-4 mb-3`}
      activeOpacity={0.8}
    >
      <View className="mb-3">{icon}</View>
      <Text className="text-[15px] font-bold text-[#444]">{title}</Text>
      <Text className="text-xs text-[#888] mt-0.5">{subtitle}</Text>
    </TouchableOpacity>
  );
}
