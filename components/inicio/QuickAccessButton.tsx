import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { QuickAccessButtonProps } from "../../types/components";

export const QuickAccessButton = React.memo(function QuickAccessButton({
  title,
  subtitle,
  icon,
  bgColor,
}: QuickAccessButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className={`${bgColor} flex-1 min-w-[47%] rounded-3xl p-5 mb-3 mx-1 border border-borda/30`}
      activeOpacity={0.8}
      onPress={() => {
        if (title === "Meu Diário") {
          router.push("/diario" as any);
        } else if (title === "Consultas") {
          router.push("/consultas" as any);
        } else if (title === "Respiração") {
          router.push("/respiracao" as any);
        }
      }}
    >
      <View className="mb-3">{icon}</View>
      <Text className="text-base font-bold text-texto">{title}</Text>
      <Text className="text-xs text-texto-2 mt-1">{subtitle}</Text>
    </TouchableOpacity>
  );
});
