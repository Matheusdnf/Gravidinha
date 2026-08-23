import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSendLink = () => {
    if (email.trim() !== "") {
      // Navega para a tela de confirmação passando o e-mail via query param
      router.push({
        pathname: "/(auth)/confirmacao",
        params: { email: email.trim() },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center relative">
      {/* Círculo Orgânico Decorativo */}
      <View className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-[#F3E2D4] opacity-70 pointer-events-none" />

      <View className="w-full max-w-xl flex-1 px-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Botão Voltar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#A37262" />
            <Text className="text-[#A37262] font-semibold text-sm ml-1.5">
              Voltar
            </Text>
          </TouchableOpacity>

          {/* Ícone de Envelope */}
          <View className="bg-[#FDF2EE] border border-[#FADCD0] w-14 h-14 rounded-2xl items-center justify-center mb-6">
            <Feather name="mail" size={24} color="#D97D54" />
          </View>

          {/* Título e Descrição */}
          <Text className="text-3xl font-extrabold text-[#2C221E] tracking-tight mb-2">
            Recuperar Senha
          </Text>
          <Text className="text-sm font-medium text-[#8A7A75] leading-relaxed mb-8">
            Sem problemas! Informe seu e-mail cadastrado e enviaremos um link
            para você criar uma nova senha com segurança.
          </Text>

          {/* Campo: E-mail cadastrado */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              E-mail cadastrado
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#C2B2AC"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5 text-sm text-[#2C221E]"
            />
          </View>

          {/* Box de Segurança */}
          <View className="bg-[#EEF6F6] border border-[#D1E5E5] rounded-2xl p-4 flex-row items-center mb-8">
            <Text className="text-lg mr-3">🔒</Text>
            <Text className="text-xs text-[#4FA3A5] font-semibold flex-1 leading-relaxed">
              Por segurança, o link de recuperação expira em 30 minutos e só
              pode ser usado uma vez.
            </Text>
          </View>

          {/* Botão Enviar Link */}
          <TouchableOpacity
            className="bg-[#E2B19C] active:bg-[#D97D54] rounded-2xl py-4 items-center justify-center shadow-sm"
            activeOpacity={0.9}
            onPress={handleSendLink}
          >
            <Text className="text-white font-extrabold text-base">
              Enviar Link de Recuperação
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
