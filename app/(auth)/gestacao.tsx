import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../state/auth";
import { setRegistrationData } from "../../state/registrationStore";
import { BackButton } from "../../components/BackButton";

export default function GestacaoScreen() {
  const router = useRouter();
  const { jaTeveGestacao } = useLocalSearchParams();
  const temGestacao = jaTeveGestacao === 'true';
  const { user } = useAuth();

  // Estados dos seletores
  const [primeiraGestacao, setPrimeiraGestacao] = useState<boolean | null>(
    temGestacao ? false : true,
  );
  const [qtdBebes, setQtdBebes] = useState<"um" | "gemeos" | "multiplos">("um");
  const [tipoGemeos, setTipoGemeos] = useState<
    "univitelinos" | "bivitelinos" | null
  >(null);
  const [errorGemeos, setErrorGemeos] = useState<string | null>(null);

  const handleContinuar = () => {
    let finalQtd = qtdBebes as string;
    if (qtdBebes === "gemeos") {
      if (!tipoGemeos) {
        setErrorGemeos("Por favor, selecione o tipo de gêmeos.");
        return;
      }
      finalQtd = `gemeos_${tipoGemeos}`;
    }

    setRegistrationData({
      primeiraGestacao,
      qtdBebes: finalQtd,
    });

    router.push("/(auth)/linha-tempo");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center relative">
      {/* Círculo Orgânico Decorativo no Canto Superior Direito */}
      <View className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-[#F3E2D4] opacity-70 pointer-events-none" />

      <View className="w-full max-w-xl flex-1 px-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        >
          {/* BARRA SUPERIOR: VOLTAR, PASSO & PORCENTAGEM */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <BackButton fallback={user ? "/(tabs)" : "/(auth)/registro"} className="" />

              <Text className="text-xs font-semibold text-[#8A7A75]">
                Passo 1 de 2
              </Text>
              <Text className="text-xs font-bold text-[#C56A43]">50%</Text>
            </View>

            {/* Barra de Progresso Truncada */}
            <View className="w-full h-2 bg-[#EFE6DF] rounded-full overflow-hidden mb-3">
              <View className="w-[50%] h-full bg-[#C56A43] rounded-full" />
            </View>

            {/* Indicadores de bolinhas abaixo da barra */}
            <View className="flex-row justify-center items-center">
              <View className="w-6 h-2 bg-[#C56A43] rounded-full mr-1.5" />
              <View className="w-2 h-2 bg-[#E2BBAE] rounded-full" />
            </View>
          </View>

          {/* TÍTULO E DESCRITIVO */}
          <Text className="text-3xl font-extrabold text-[#2C221E] tracking-tight mb-2 leading-tight">
            Sobre a sua{"\n"}gestação
          </Text>
          <Text className="text-sm font-medium text-[#8A7A75] leading-relaxed mb-8">
            Algumas perguntas rápidas para preparar o conteúdo ideal para você.
            🌸
          </Text>

          {/* PERGUNTA 1: PRIMEIRA GESTAÇÃO */}
          {!temGestacao && (
            <>
              <Text className="text-sm font-bold text-[#2C221E] mb-3">
                É a sua primeira gestação?
              </Text>

              <View className="flex-row justify-between mb-8">
                {/* Opção: Sim */}
                <TouchableOpacity
                  onPress={() => setPrimeiraGestacao(true)}
                  className={`w-[48%] rounded-3xl p-5 items-center justify-center border ${
                    primeiraGestacao === true
                      ? "bg-white border-[#F0EBE6] shadow-sm"
                      : "bg-white/60 border-transparent"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className="text-3xl mb-3">🌟</Text>
                  <Text className="text-xs font-bold text-[#2C221E] text-center leading-relaxed">
                    Sim, de primeira{"\n"}viagem
                  </Text>
                </TouchableOpacity>

                {/* Opção: Não */}
                <TouchableOpacity
                  onPress={() => setPrimeiraGestacao(false)}
                  className={`w-[48%] rounded-3xl p-5 items-center justify-center border ${
                    primeiraGestacao === false
                      ? "bg-white border-[#F0EBE6] shadow-sm"
                      : "bg-white/60 border-transparent"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className="text-3xl mb-3">👨‍👩‍👧</Text>
                  <Text className="text-xs font-bold text-[#2C221E] text-center leading-relaxed">
                    Não, já tenho{"\n"}filhos
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* PERGUNTA 2: QUANTIDADE DE BEBÊS */}
          <Text className="text-sm font-bold text-[#2C221E] mb-3">
            Quantos bebês você está esperando?
          </Text>

          {/* Segmented Control / Botões de Abas */}
          <View
            className={`flex-row bg-white border border-[#F0EBE6] rounded-2xl p-1 w-full overflow-hidden ${qtdBebes === "gemeos" ? "mb-6" : "mb-10"}`}
          >
            {/* Um bebê */}
            <TouchableOpacity
              onPress={() => setQtdBebes("um")}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${
                qtdBebes === "um" ? "bg-[#C56A43]" : "bg-transparent"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-bold ${
                  qtdBebes === "um" ? "text-white" : "text-[#8A7A75]"
                }`}
              >
                Um bebê
              </Text>
            </TouchableOpacity>

            {/* Gêmeos */}
            <TouchableOpacity
              onPress={() => setQtdBebes("gemeos")}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${
                qtdBebes === "gemeos" ? "bg-[#C56A43]" : "bg-transparent"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-bold ${
                  qtdBebes === "gemeos" ? "text-white" : "text-[#8A7A75]"
                }`}
              >
                Gêmeos
              </Text>
            </TouchableOpacity>

            {/* Múltiplos */}
            <TouchableOpacity
              onPress={() => setQtdBebes("multiplos")}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${
                qtdBebes === "multiplos" ? "bg-[#C56A43]" : "bg-transparent"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-bold ${
                  qtdBebes === "multiplos" ? "text-white" : "text-[#8A7A75]"
                }`}
              >
                Múltiplos
              </Text>
            </TouchableOpacity>
          </View>

          {/* PERGUNTA CONDICIONAL PARA GÊMEOS */}
          {qtdBebes === "gemeos" && (
            <View className="mb-10">
              <Text className="text-sm font-bold text-[#2C221E] mb-3">
                Os gêmeos são idênticos?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setTipoGemeos("univitelinos");
                  setErrorGemeos(null);
                }}
                className={`w-full rounded-2xl p-4 mb-3 border ${
                  tipoGemeos === "univitelinos"
                    ? "bg-white border-[#C56A43] shadow-sm"
                    : "bg-white/60 border-transparent"
                }`}
                activeOpacity={0.8}
              >
                <Text className="text-sm font-bold text-[#2C221E] mb-1">
                  Sim, idênticos (Univitelinos)
                </Text>
                <Text className="text-xs text-[#8A7A75] leading-relaxed">
                  Formados pela divisão de um único óvulo fertilizado.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTipoGemeos("bivitelinos");
                  setErrorGemeos(null);
                }}
                className={`w-full rounded-2xl p-4 border ${
                  tipoGemeos === "bivitelinos"
                    ? "bg-white border-[#C56A43] shadow-sm"
                    : "bg-white/60 border-transparent"
                }`}
                activeOpacity={0.8}
              >
                <Text className="text-sm font-bold text-[#2C221E] mb-1">
                  Não, bivitelinos
                </Text>
                <Text className="text-xs text-[#8A7A75] leading-relaxed">
                  Originados da fecundação de dois óvulos por espermatozoides
                  diferentes.
                </Text>
              </TouchableOpacity>
              {errorGemeos && (
                <Text className="text-red-500 text-[11px] mt-2 ml-1">
                  {errorGemeos}
                </Text>
              )}
            </View>
          )}

          {/* BOTÃO CONTINUAR */}
          <TouchableOpacity
            className="bg-[#D97D54] active:bg-[#C56A43] rounded-2xl py-4 items-center justify-center shadow-sm"
            activeOpacity={0.9}
            onPress={handleContinuar}
          >
            <Text className="text-white font-extrabold text-base">
              Continuar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
