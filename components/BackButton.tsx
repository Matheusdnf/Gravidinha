import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

// "Voltar": volta no histórico ou, sem histórico (ex.: refresh na web), vai para `fallback`
export function BackButton({ fallback, className = "mb-4" }: { fallback: Href; className?: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      className={`flex-row items-center ${className}`}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={18} color="#A37262" />
      <Text className="text-[#A37262] font-semibold text-sm ml-1.5">Voltar</Text>
    </TouchableOpacity>
  );
}
