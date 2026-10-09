import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { setRegistrationData } from "../../state/registrationStore";
import { mascaraCelular } from "../../lib/formato";
import { CalendarModal } from "../../components/CalendarModal";
import { hojeISO, isoParaBR } from "../../lib/gestacao";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegistroScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const formatDataNascimento = (text: string) => {
    let val = text.replace(/\D/g, "");
    if (val.length > 8) val = val.substring(0, 8);

    if (val.length > 2) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    if (val.length > 5) {
      val = `${val.substring(0, 5)}/${val.substring(5)}`;
    }
    setDataNascimento(val);
  };

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !celular || !dataNascimento) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }
    if (nome.trim().length < 3) {
      Alert.alert("Atenção", "O nome deve ter pelo menos 3 caracteres.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Atenção", "Por favor, insira um e-mail válido.");
      return;
    }
    const celularLimpo = celular.replace(/\D/g, "");
    if (celularLimpo.length < 10 || celularLimpo.length > 11) {
      Alert.alert("Atenção", "Por favor, insira um celular válido (com DDD).");
      return;
    }
    if (senha.length < 8) {
      Alert.alert("Atenção", "A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }
    if (dataNascimento.length !== 10) {
      Alert.alert("Atenção", "Por favor, insira uma data de nascimento válida (DD/MM/AAAA).");
      return;
    }
    if (!aceitouTermos) {
      Alert.alert("Atenção", "Você precisa aceitar os termos de uso.");
      return;
    }

    // Não salvamos no banco ainda, apenas guardamos na memória
    setRegistrationData({ nome, email, senha, celular, dataNascimento });
    router.replace("/(auth)/gestacao");
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
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
          {/* Botão Voltar */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="flex-row items-center mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#A37262" />
            <Text className="text-[#A37262] font-semibold text-sm ml-1.5">
              Voltar ao login
            </Text>
          </TouchableOpacity>

          {/* Título Principal */}
          <Text className="text-3xl font-extrabold text-[#2C221E] tracking-tight mb-1">
            Criar minha conta
          </Text>
          <Text className="text-sm font-medium text-[#8A7A75] mb-8">
            Junte-se a milhares de mães em jornada 🌸
          </Text>

          {/* Campo: Nome completo */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              Nome completo
            </Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Como você se chama?"
              placeholderTextColor="#C2B2AC"
              className="bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5 text-sm text-[#2C221E]"
            />
          </View>

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

          {/* Campo: Celular */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              Celular
            </Text>
            <TextInput
              value={celular}
              onChangeText={(t) => setCelular(mascaraCelular(t))}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#C2B2AC"
              keyboardType="phone-pad"
              maxLength={15}
              className="bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5 text-sm text-[#2C221E]"
            />
          </View>

          {/* Campo: Data de Nascimento */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              Data de Nascimento
            </Text>
            <View className="flex-row items-center bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5">
              <TextInput
                value={dataNascimento}
                onChangeText={formatDataNascimento}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#C2B2AC"
                keyboardType="number-pad"
                maxLength={10}
                className="flex-1 text-sm text-[#2C221E] p-0"
              />
              <TouchableOpacity onPress={() => setIsCalendarVisible(true)}>
                <Ionicons name="calendar-outline" size={20} color="#A37262" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo: Senha */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">Senha</Text>
            <View className="flex-row items-center bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5">
              <TextInput
                value={senha}
                onChangeText={setSenha}
                placeholder="Mínimo 8 caracteres"
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

          {/* Campo: Confirmar senha */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              Confirmar senha
            </Text>
            <View className="flex-row items-center bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5">
              <TextInput
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                placeholder="Repita sua senha"
                placeholderTextColor="#C2B2AC"
                secureTextEntry={!showConfirmarSenha}
                className="flex-1 text-sm text-[#2C221E] p-0"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
              >
                <Ionicons
                  name={showConfirmarSenha ? "eye-outline" : "eye-outline"}
                  size={20}
                  color="#A37262"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Checkbox Termos de Uso */}
          <TouchableOpacity
            onPress={() => setAceitouTermos(!aceitouTermos)}
            className="flex-row items-start mb-8"
            activeOpacity={0.8}
          >
            <View
              className={`w-6 h-6 rounded-full border items-center justify-center mr-3 mt-0.5 ${
                aceitouTermos
                  ? "bg-[#D97D54] border-[#D97D54]"
                  : "bg-transparent border-[#E2BBAE]"
              }`}
            >
              {aceitouTermos && (
                <Ionicons name="checkmark" size={14} color="#FFF" />
              )}
            </View>
            <Text className="text-xs text-[#8A7A75] leading-relaxed flex-1 font-medium">
              Li e aceito os{" "}
              <Text className="text-[#C56A43] font-bold">Termos de Uso</Text> e
              a{" "}
              <Text className="text-[#C56A43] font-bold">
                Política de Privacidade
              </Text>{" "}
              da Cartilha Virtual
            </Text>
          </TouchableOpacity>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            className="bg-[#D97D54] active:bg-[#C56A43] rounded-2xl py-4 items-center justify-center mb-6 shadow-sm"
            activeOpacity={0.9}
            onPress={handleRegister}
          >
            <Text className="text-white font-extrabold text-base">
              Cadastrar
            </Text>
          </TouchableOpacity>

          {/* Link para Login */}
          <View className="flex-row justify-center items-center">
            <Text className="text-sm font-medium text-[#8A7A75]">
              Já tem conta?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-sm font-bold text-[#C56A43]">Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        selectedDate={dataNascimento.length === 10 ? dataNascimento : ""}
        maxDate={hojeISO()}
        onDayPress={(day) => {
          setDataNascimento(isoParaBR(day.dateString));
          setIsCalendarVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
