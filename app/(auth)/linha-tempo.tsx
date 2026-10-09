import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../state/auth";
import { clearRegistrationData, getRegistrationData } from "../../state/registrationStore";
import { Bebe } from "../../types/pregnancy";
import { cadastrar, criarGestacao } from "../../lib/dados";
import { getTrimestre, isoParaBR, paraISO } from "../../lib/gestacao";
import { BackButton } from "../../components/BackButton";
import { CalendarModal } from "../../components/CalendarModal";
import { SexoSelector } from "../../components/SexoSelector";

export default function LinhaTempoGestacaoScreen() {
  const router = useRouter();
  const params = getRegistrationData();
  const { user, signIn, setSelectedGestacao } = useAuth();
  const [loading, setLoading] = useState(false);

  const qBebesStr = params.qtdBebes;
  const numBebes = qBebesStr === "multiplos" ? 3 : (qBebesStr?.startsWith("gemeos") ? 2 : 1);

  // Estados do formulário
  const [nomeGestacao, setNomeGestacao] = useState<string>("");
  const [semanas, setSemanas] = useState<number>(12);
  const [dpp, setDpp] = useState<string>("");
  
  const [bebes, setBebes] = useState<Bebe[]>(
    Array(numBebes).fill(null).map(() => ({ nome: "", sexo: "nao_informado", aindaNaoDecidiuNome: false }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const atualizarBebe = (index: number, patch: Partial<Bebe>) => {
    setBebes((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
    if (errors[`bebe_${index}_nome`]) setErrors((prev) => ({ ...prev, [`bebe_${index}_nome`]: "" }));
  };

  // Lógica para calcular o trimestre com base nas semanas
  const trimestreTexto = useMemo(() => getTrimestre(semanas), [semanas]);

  // Controles do contador
  const incrementarSemanas = () => {
    if (semanas < 45) setSemanas((prev) => prev + 1);
  };

  const decrementarSemanas = () => {
    if (semanas > 1) setSemanas((prev) => prev - 1);
  };

  const handleFinalizar = async () => {
    const newErrors: Record<string, string> = {};

    let formattedDpp: string | null = null;
    if (dpp.trim() !== "") {
      const dppRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      const cleanedDpp = dpp.replace(/\s/g, "");
      if (!dppRegex.test(cleanedDpp)) {
        newErrors.dpp = "Formato inválido. Use dd/mm/aaaa";
      } else {
        const parts = cleanedDpp.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        if (day < 1 || day > 31 || month < 1 || month > 12) {
          newErrors.dpp = "Data inválida.";
        } else {
          formattedDpp = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }

    bebes.forEach((bebe, index) => {
      if (!bebe.aindaNaoDecidiuNome && bebe.nome.trim() === "") {
        newErrors[`bebe_${index}_nome`] = "Por favor, insira o nome do bebê.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert("Atenção", "Existem campos não preenchidos ou incorretos. Por favor, verifique.");
      return;
    }
    
    setErrors({});
    setLoading(true);
    try {
      // 1. Se não houver usuário logado, significa que é um novo cadastro
      if (!user) {
        if (!params.nome || !params.email || !params.senha || !params.celular || !params.dataNascimento) {
          Alert.alert("Erro", "Faltam dados do usuário para o cadastro. Volte ao início.");
          setLoading(false);
          return;
        }

        // Loga já aqui: se a criação da gestação falhar, a nova tentativa usa esta conta
        // em vez de tentar cadastrar o mesmo e-mail de novo
        await signIn(await cadastrar({
          nome: params.nome,
          email: params.email,
          senha: params.senha,
          celular: params.celular,
          dataNascimento: paraISO(params.dataNascimento)!,
        }));
      }

      // 2. Criar a gestação (o dono é a usuária da sessão)
      const gestacao = await criarGestacao({
        nomeGestacao: nomeGestacao,
        semanas: Number(semanas),
        dpp: formattedDpp,
        primeiraGestacao: params.primeiraGestacao === true || params.primeiraGestacao === "true",
        qtdBebes: params.qtdBebes,
        bebes: bebes,
      });

      clearRegistrationData();
      // Devolve a gestação completa (semanas, data_inicio, filhos...)
      await setSelectedGestacao(gestacao);
      Alert.alert("Sucesso", "Tudo pronto! Bem-vinda ao seu diário de bordo.");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
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
          {/* BARRA SUPERIOR: VOLTAR, PASSO & PORCENTAGEM */}
          <View className="flex-row items-center justify-between mb-4">
            <BackButton fallback="/(auth)/gestacao" className="" />

            <Text className="text-xs font-semibold text-[#8A7A75]">
              Passo 2 de 2
            </Text>

            <Text className="text-xs font-bold text-[#C56A43]">100%</Text>
          </View>

          {/* BARRA DE PROGRESSO 100% */}
          <View className="w-full h-2 bg-[#EFE6DF] rounded-full overflow-hidden mb-3">
            <View className="w-full h-full bg-[#C56A43] rounded-full" />
          </View>

          {/* Indicadores de bolinhas */}
          <View className="flex-row justify-center items-center mb-6">
            <View className="w-2 h-2 bg-[#E2BBAE] rounded-full mr-1.5" />
            <View className="w-6 h-2 bg-[#C56A43] rounded-full" />
          </View>

          {/* TÍTULO E DESCRITIVO */}
          <Text className="text-3xl font-extrabold text-[#2C221E] tracking-tight mb-2 leading-tight">
            Linha do tempo{"\n"}da sua gestação
          </Text>
          <Text className="text-sm font-medium text-[#8A7A75] leading-relaxed mb-8">
            Essas informações personalizam seus conteúdos e lembretes.
          </Text>

          {/* NOME DA GESTAÇÃO */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              Nome da Gestação (Opcional)
            </Text>
            <TextInput
              value={nomeGestacao}
              onChangeText={setNomeGestacao}
              placeholder="Ex: Primeira Viagem, Gêmeos 2026..."
              placeholderTextColor="#C2B2AC"
              className="bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5 text-sm text-[#2C221E]"
            />
          </View>

          {/* PERGUNTA 1: QUANTAS SEMANAS */}
          <Text className="text-sm font-bold text-[#2C221E] mb-3">
            De quantas semanas você está?
          </Text>

          {/* CONTADOR DE SEMANAS INTERATIVO */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={decrementarSemanas}
              className="w-12 h-12 rounded-2xl bg-white border border-[#F0EBE6] items-center justify-center shadow-sm"
              activeOpacity={0.7}
            >
              <Text className="text-xl font-bold text-[#8A7A75]">-</Text>
            </TouchableOpacity>

            {/* BOX CENTRAL DO NÚMERO */}
            <View className="flex-1 mx-3 bg-[#FDF2EE] border border-[#FADCD0] rounded-3xl py-4 items-center justify-center">
              <TextInput
                keyboardType="numeric"
                value={semanas.toString()}
                onChangeText={(text) => {
                  const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
                  if (!isNaN(val)) {
                    setSemanas(Math.max(1, Math.min(45, val)));
                  }
                }}
                className="text-4xl font-extrabold text-[#C56A43] leading-none mb-1 text-center p-0"
              />
              <Text className="text-xs font-bold text-[#8A7A75]">
                {trimestreTexto}
              </Text>
            </View>

            <TouchableOpacity
              onPress={incrementarSemanas}
              className="w-12 h-12 rounded-2xl bg-white border border-[#F0EBE6] items-center justify-center shadow-sm"
              activeOpacity={0.7}
            >
              <Text className="text-xl font-bold text-[#8A7A75]">+</Text>
            </TouchableOpacity>
          </View>

          {/* SLIDER VISUAL / BARRA DE NÍVEL */}
          <View className="mb-8 px-2">
            <View className="w-full h-1.5 bg-[#E2EDED] rounded-full relative justify-center">
              <View
                style={{ width: `${Math.min(100, Math.max(0, (semanas / 45) * 100)).toFixed(1)}%` as any }}
                className="h-full bg-[#C56A43] rounded-full"
              />
              <View
                style={{
                  left: `${Math.min(100, Math.max(0, (semanas / 45) * 100)).toFixed(1)}%` as any,
                  transform: [{ translateX: -10 }]
                }}
                className="absolute w-5 h-5 rounded-full bg-[#8A7A75] border-2 border-white shadow-sm"
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-[10px] font-bold text-[#8A7A75]">
                1 semana
              </Text>
              <Text className="text-[10px] font-bold text-[#8A7A75]">
                45 semanas
              </Text>
            </View>
          </View>

          {/* CAMPO: DATA PROVÁVEL DO PARTO (DPP) */}
          <View className="mb-2">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              Data Provável do Parto (DPP)
            </Text>
            <TouchableOpacity 
              onPress={() => setIsCalendarVisible(true)}
              activeOpacity={0.8}
              className={`flex-row items-center justify-between bg-[#FDF2EE] border ${errors.dpp ? 'border-red-400' : 'border-[#FADCD0]'} rounded-2xl px-4 py-3.5`}
            >
              <Text className={`flex-1 text-sm ${dpp ? 'text-[#2C221E]' : 'text-[#C2B2AC]'}`}>
                {dpp || "dd / mm / aaaa"}
              </Text>
              <Feather name="calendar" size={18} color="#A37262" />
            </TouchableOpacity>
            {errors.dpp && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.dpp}</Text>}
          </View>

          {/* DICA AUTOMÁTICA */}
          <Text className="text-xs text-[#8A7A75] font-medium leading-relaxed mb-8">
            💡 Se não souber ao certo, calcularemos automaticamente pelas
            semanas informadas acima.
          </Text>

          {/* BEBÊS */}
          <View className="mb-8">
            <Text className="text-sm font-bold text-[#2C221E] mb-2">
              Detalhes do(s) bebê(s)
            </Text>
            {bebes.map((bebe, index) => (
              <View key={index} className="bg-white border border-[#F0EBE6] rounded-2xl p-4 mb-4 shadow-sm">
                <Text className="text-xs font-bold text-[#2C221E] mb-3">
                  {numBebes > 1 ? `Bebê ${index + 1}` : "Seu Bebê"}
                </Text>
                
                {/* SWITCH: AINDA NÃO DECIDI O NOME */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-[11px] font-bold text-[#2C221E]">
                      Ainda não decidi o nome
                    </Text>
                  </View>
                  <Switch
                    value={bebe.aindaNaoDecidiuNome}
                    onValueChange={(val) =>
                      atualizarBebe(index, val ? { aindaNaoDecidiuNome: true, nome: "" } : { aindaNaoDecidiuNome: false })
                    }
                    trackColor={{ false: "#E2EDED", true: "#C56A43" }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* NOME DO BEBÊ */}
                {!bebe.aindaNaoDecidiuNome && (
                  <View className="mb-3">
                    <TextInput
                      value={bebe.nome}
                      onChangeText={(text) => atualizarBebe(index, { nome: text })}
                      placeholder="Ex: Sophia, Lucas..."
                      placeholderTextColor="#C2B2AC"
                      className={`bg-[#FDF2EE] border ${errors[`bebe_${index}_nome`] ? 'border-red-400' : 'border-[#FADCD0]'} rounded-xl px-4 py-3 text-sm text-[#2C221E]`}
                    />
                    {errors[`bebe_${index}_nome`] && <Text className="text-red-500 text-[11px] mt-1.5 ml-1">{errors[`bebe_${index}_nome`]}</Text>}
                  </View>
                )}

                {/* SEXO DO BEBÊ */}
                <Text className="text-[11px] font-bold text-[#8A7A75] mb-2 uppercase tracking-wider">
                  Sexo do Bebê (Opcional)
                </Text>
                <SexoSelector
                  value={bebe.sexo}
                  onChange={(sexo) => atualizarBebe(index, { sexo: sexo as Bebe["sexo"] })}
                  bg="#FDF2EE"
                  borda="#FADCD0"
                />
              </View>
            ))}
          </View>

          {/* BOTÃO FINALIZAR */}
          <TouchableOpacity
            className={`bg-[#C56A43] active:bg-[#B05B35] rounded-2xl py-4 items-center justify-center shadow-sm ${loading ? 'opacity-70' : ''}`}
            activeOpacity={0.9}
            onPress={handleFinalizar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-extrabold text-base">
                Finalizar e Ir para o Início
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        selectedDate={dpp}
        onDayPress={(day) => {
          setDpp(isoParaBR(day.dateString));
          if (errors.dpp) setErrors(prev => ({ ...prev, dpp: "" }));
          setIsCalendarVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
