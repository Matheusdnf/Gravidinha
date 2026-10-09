import React from "react";
import { useRouter } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ProfileMenuOption } from "../../types/profile";

export const ProfileMenuOptions = React.memo(function ProfileMenuOptions({
  title,
  subtitle,
  iconName,
  iconColor,
  bgColor,
}: ProfileMenuOption) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 border-b border-gray-50/70 w-full"
      activeOpacity={0.7}
      onPress={() => {
        if (title === "Agenda de Consultas") {
          router.push("/consultas" as any);
        } else if (title === "Meu Diário") {
          router.push("/diario" as any);
        } else if (title === "Minhas Gestações" || title === "Dados da Gravidez") {
          router.push("/dados-gravidez" as any);
        } else if (title === "Respiração Guiada") {
          router.push("/respiracao" as any);
        } else if (title === "Desenvolvimento da Gestação") {
          router.push("/desenvolvimento/lista" as any);
        }
      }}
    >
      <View className="flex-row items-center">
        <View className={`${bgColor} w-10 h-10 rounded-2xl items-center justify-center mr-3`}>
          <MaterialCommunityIcons name={iconName as any} size={20} color={iconColor} />
        </View>
        <View>
          <Text className="text-[15px] font-bold text-gray-800">{title}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );
});
