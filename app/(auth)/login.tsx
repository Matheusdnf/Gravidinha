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
import { useCores } from "../../lib/tema";
import { LIMITES, validarEmail } from "../../lib/validacao";

export default function LoginScreen() {
  const cores = useCores();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);
  const borda = (erro: boolean) => (erro ? "border-red-400" : "border-pessego-borda");

  const handleLogin = async () => {
    const emailInvalido = !email || !!validarEmail(email);
    setErroEmail(emailInvalido);
    setErroSenha(!senha);
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (emailInvalido) {
      Alert.alert("Atenção", validarEmail(email)!);
      return;
    }

    setLoading(true);
    try {
      await signIn(await entrar(email, senha));
      router.replace("/(tabs)");
    } catch (error: any) {
      // Credenciais erradas: não dizemos qual campo, então marca os dois
      setErroEmail(true);
      setErroSenha(true);
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fundo items-center relative">
      {/* Círculo Orgânico Decorativo no Canto Superior Direito — fica fixo */}
      <View className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-areia opacity-70 pointer-events-none" />

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
            <Text className="text-3xl font-extrabold text-texto tracking-tight mb-1">
              Boas-vindas de volta!
            </Text>
            <Text className="text-sm font-medium text-texto-suave mb-8">
              Acompanhe o seu bebê e sua jornada diária 🌸
            </Text>

            {/* Campo: E-mail */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-texto mb-2">
                E-mail
              </Text>
              <TextInput
                value={email}
                onChangeText={(t) => { setEmail(t); setErroEmail(false); }}
                maxLength={LIMITES.email}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor={cores.textoFraco}
                keyboardType="email-address"
                autoCapitalize="none"
                className={`bg-pessego border ${borda(erroEmail)} rounded-2xl px-4 py-3.5 text-sm text-texto`}
              />
            </View>

            {/* Campo: Senha */}
            <View className="mb-3">
              <Text className="text-sm font-bold text-texto mb-2">Senha</Text>
              <View className={`flex-row items-center bg-pessego border ${borda(erroSenha)} rounded-2xl px-4 py-3.5`}>
                <TextInput
                  value={senha}
                  onChangeText={(t) => { setSenha(t); setErroSenha(false); }}
                  maxLength={LIMITES.senha.max}
                  placeholder="Digite sua senha"
                  placeholderTextColor={cores.textoFraco}
                  secureTextEntry={!showSenha}
                  className="flex-1 text-sm text-texto p-0"
                />
                <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                  <Ionicons
                    name={showSenha ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={cores.marrom}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Entrar */}
            <TouchableOpacity
              className={`mt-4 bg-[#D97D54] active:bg-[#C56A43] rounded-2xl py-4 items-center justify-center mb-6 shadow-sm ${loading ? 'opacity-70' : ''}`}
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
              <Text className="text-sm font-medium text-texto-suave">
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
