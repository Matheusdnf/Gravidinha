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
import { useCores } from "../../lib/tema";
import { LIMITES, validarCelular, validarDataNascimento, validarEmail, validarNomePessoa, validarSenha } from "../../lib/validacao";

export default function RegistroScreen() {
  const cores = useCores();
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

  const [erros, setErros] = useState<Record<string, boolean>>({});
  const limpaErro = (campo: string) => setErros((p) => ({ ...p, [campo]: false }));
  const borda = (campo: string) => (erros[campo] ? "border-red-400" : "border-pessego-borda");

  const handleRegister = async () => {
    const msgs: Record<string, string | null> = {
      nome: validarNomePessoa(nome),
      email: validarEmail(email),
      celular: validarCelular(celular),
      dataNascimento: validarDataNascimento(dataNascimento),
      senha: validarSenha(senha),
      confirmarSenha: senha !== confirmarSenha ? "As senhas não coincidem." : null,
    };
    setErros(Object.fromEntries(Object.entries(msgs).map(([k, m]) => [k, !!m])));
    // Mantém a ordem de prioridade da mensagem exibida
    const erro =
      msgs.nome || msgs.email || msgs.celular || msgs.senha || msgs.confirmarSenha || msgs.dataNascimento;
    if (erro) {
      Alert.alert("Atenção", erro);
      return;
    }
    if (!aceitouTermos) {
      Alert.alert("Atenção", "Você precisa aceitar os termos de uso.");
      return;
    }

    // Não salvamos no banco ainda, apenas guardamos na memória
    setRegistrationData({ nome: nome.trim(), email: email.trim(), senha, celular, dataNascimento });
    router.replace("/(auth)/gestacao");
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
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
          {/* Botão Voltar */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="flex-row items-center mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={cores.marrom} />
            <Text className="text-marrom font-semibold text-sm ml-1.5">
              Voltar ao login
            </Text>
          </TouchableOpacity>

          {/* Título Principal */}
          <Text className="text-3xl font-extrabold text-texto tracking-tight mb-1">
            Criar minha conta
          </Text>
          <Text className="text-sm font-medium text-texto-suave mb-8">
            Junte-se a milhares de mães em jornada 🌸
          </Text>

          {/* Campo: Nome completo */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-texto mb-2">
              Nome completo
            </Text>
            <TextInput
              value={nome}
              onChangeText={(t) => { setNome(t); limpaErro("nome"); }}
              maxLength={LIMITES.nomePessoa.max}
              placeholder="Como você se chama?"
              placeholderTextColor={cores.textoFraco}
              className={`bg-pessego border ${borda("nome")} rounded-2xl px-4 py-3.5 text-sm text-texto`}
            />
          </View>

          {/* Campo: E-mail */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-texto mb-2">
              E-mail
            </Text>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); limpaErro("email"); }}
              maxLength={LIMITES.email}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={cores.textoFraco}
              keyboardType="email-address"
              autoCapitalize="none"
              className={`bg-pessego border ${borda("email")} rounded-2xl px-4 py-3.5 text-sm text-texto`}
            />
          </View>

          {/* Campo: Celular */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-texto mb-2">
              Celular
            </Text>
            <TextInput
              value={celular}
              onChangeText={(t) => { setCelular(mascaraCelular(t)); limpaErro("celular"); }}
              placeholder="(11) 99999-9999"
              placeholderTextColor={cores.textoFraco}
              keyboardType="phone-pad"
              maxLength={15}
              className={`bg-pessego border ${borda("celular")} rounded-2xl px-4 py-3.5 text-sm text-texto`}
            />
          </View>

          {/* Campo: Data de Nascimento */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-texto mb-2">
              Data de Nascimento
            </Text>
            <View className={`flex-row items-center bg-pessego border ${borda("dataNascimento")} rounded-2xl px-4 py-3.5`}>
              <TextInput
                value={dataNascimento}
                onChangeText={(t) => { formatDataNascimento(t); limpaErro("dataNascimento"); }}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={cores.textoFraco}
                keyboardType="number-pad"
                maxLength={10}
                className="flex-1 text-sm text-texto p-0"
              />
              <TouchableOpacity onPress={() => setIsCalendarVisible(true)}>
                <Ionicons name="calendar-outline" size={20} color={cores.marrom} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo: Senha */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-texto mb-2">Senha</Text>
            <View className={`flex-row items-center bg-pessego border ${borda("senha")} rounded-2xl px-4 py-3.5`}>
              <TextInput
                value={senha}
                onChangeText={(t) => { setSenha(t); limpaErro("senha"); }}
                maxLength={LIMITES.senha.max}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={cores.textoFraco}
                secureTextEntry={!showSenha}
                className="flex-1 text-sm text-texto p-0"
              />
              <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                <Ionicons
                  name={showSenha ? "eye-outline" : "eye-outline"}
                  size={20}
                  color={cores.marrom}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo: Confirmar senha */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-texto mb-2">
              Confirmar senha
            </Text>
            <View className={`flex-row items-center bg-pessego border ${borda("confirmarSenha")} rounded-2xl px-4 py-3.5`}>
              <TextInput
                value={confirmarSenha}
                onChangeText={(t) => { setConfirmarSenha(t); limpaErro("confirmarSenha"); }}
                maxLength={LIMITES.senha.max}
                placeholder="Repita sua senha"
                placeholderTextColor={cores.textoFraco}
                secureTextEntry={!showConfirmarSenha}
                className="flex-1 text-sm text-texto p-0"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
              >
                <Ionicons
                  name={showConfirmarSenha ? "eye-outline" : "eye-outline"}
                  size={20}
                  color={cores.marrom}
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
            <Text className="text-xs text-texto-suave leading-relaxed flex-1 font-medium">
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
            <Text className="text-sm font-medium text-texto-suave">
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
