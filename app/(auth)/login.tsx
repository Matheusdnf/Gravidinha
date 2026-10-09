import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../state/auth";
import { entrar } from "../../lib/dados";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Atenção", "Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      await signIn(await entrar(email, senha));
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center relative">
      {/* Círculo Orgânico Decorativo no Canto Superior Direito — fica fixo */}
      <View className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-[#F3E2D4] opacity-70 pointer-events-none" />

      <KeyboardAvoidingView
        className="flex-1 w-full"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="w-full max-w-xl flex-1 px-6 self-center">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 48, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Título Principal */}
            <Text className="text-3xl font-extrabold text-[#2C221E] tracking-tight mb-1">
              Boas-vindas de volta!
            </Text>
            <Text className="text-sm font-medium text-[#8A7A75] mb-8">
              Acompanhe o seu bebê e sua jornada diária 🌸
            </Text>

            {/* Campo: E-mail */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-[#2C221E] mb-2">
                E-mail
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

            {/* Campo: Senha */}
            <View className="mb-3">
              <Text className="text-sm font-bold text-[#2C221E] mb-2">Senha</Text>
              <View className="flex-row items-center bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5">
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#C2B2AC"
                  secureTextEntry={!showSenha}
                  className="flex-1 text-sm text-[#2C221E] p-0"
                />
                <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                  <Ionicons
                    name={showSenha ? "eye-outline" : "eye-outline"}
                    size={20}
                    color="#A37262"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Esqueci minha senha */}
            <TouchableOpacity
              className="align-self-end mb-8 self-end"
              onPress={() => router.push("/(auth)/esqueci_senha")}
            >
              <Text className="text-xs font-bold text-[#C56A43]">
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>

            {/* Botão Entrar */}
            <TouchableOpacity
              className={`bg-[#D97D54] active:bg-[#C56A43] rounded-2xl py-4 items-center justify-center mb-6 shadow-sm ${loading ? 'opacity-70' : ''}`}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white font-extrabold text-base">
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            {/* Link para Cadastro */}
            <View className="flex-row justify-center items-center">
              <Text className="text-sm font-medium text-[#8A7A75]">
                Ainda não tem conta?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/registro")}>
                <Text className="text-sm font-bold text-[#C56A43]">
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
