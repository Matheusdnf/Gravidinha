import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmacaoScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center relative">
      {/* Círculo Orgânico Decorativo */}
      <View className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-[#F3E2D4] opacity-70 pointer-events-none" />

      <View className="w-full max-w-xl flex-1 px-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
        >
          <View className="items-center">
            {/* Ícone de Sucesso Verde/Água */}
            <View className="bg-[#EEF6F6] border border-[#D1E5E5] w-20 h-20 rounded-3xl items-center justify-center mb-8">
              <Ionicons
                name="checkmark-circle-outline"
                size={38}
                color="#4FA3A5"
              />
            </View>

            {/* Título de Confirmação */}
            <Text className="text-3xl font-extrabold text-[#2C221E] tracking-tight mb-4 text-center">
              Link enviado!
            </Text>

            {/* Texto com o E-mail Recebido Dinamicamente */}
            <Text className="text-sm font-medium text-[#8A7A75] text-center mb-1">
              Enviamos um link de recuperação para
            </Text>
            <Text className="text-sm font-extrabold text-[#2C221E] text-center mb-8">
              {email || "seu e-mail"}
            </Text>

            <Text className="text-xs text-[#8A7A75] text-center font-medium leading-relaxed mb-10 px-4">
              Verifique também sua caixa de spam. O link expira em 30 minutos.
            </Text>

            {/* Botão Voltar ao Login */}
            <TouchableOpacity
              className="bg-[#C56A43] active:bg-[#B05B35] rounded-2xl py-4 w-full items-center justify-center mb-6 shadow-sm"
              activeOpacity={0.9}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text className="text-white font-extrabold text-base">
                Voltar ao Login
              </Text>
            </TouchableOpacity>

            {/* Opção de Tentar Novamente */}
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-xs font-bold text-[#8A7A75] text-center">
                Não recebi o e-mail,{" "}
                <Text className="text-[#C56A43]">tentar novamente</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
