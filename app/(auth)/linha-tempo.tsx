import { Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../state/auth";
import { clearRegistrationData, getRegistrationData } from "../../state/registrationStore";
import { Bebe } from "../../types/pregnancy";

// Configuração de Idioma em Português para o Calendário
LocaleConfig.locales["pt-br"] = {
  monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
  monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  dayNames: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

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

  // Lógica para calcular o trimestre com base nas semanas
  const trimestreTexto = useMemo(() => {
    if (semanas <= 13) return "1º Trimestre";
    if (semanas <= 27) return "2º Trimestre";
    return "3º Trimestre";
  }, [semanas]);

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
      let finalUserId = user?.id;
      let userObj = user;

      // 1. Se não houver usuário logado, significa que é um novo cadastro
      if (!finalUserId) {
        if (!params.nome || !params.email || !params.senha || !params.celular || !params.dataNascimento) {
          Alert.alert("Erro", "Faltam dados do usuário para o cadastro. Volte ao início.");
          setLoading(false);
          return;
        }

        // Converter dataNascimento de DD/MM/AAAA para YYYY-MM-DD
        const [dia, mes, ano] = params.dataNascimento.split("/");
        const formattedDataNascimento = `${ano}-${mes}-${dia}`;

        const resUser = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: params.nome,
            email: params.email,
            senha: params.senha,
            celular: params.celular,
            dataNascimento: formattedDataNascimento
          }),
        });

        const dataUser = await resUser.json();
        if (!resUser.ok) {
          Alert.alert("Erro", dataUser.error || "Erro ao realizar o cadastro do usuário.");
          setLoading(false);
          return;
        }

        finalUserId = dataUser.user.id;
        userObj = { ...dataUser.user, token: dataUser.token };
      }

      // 2. Criar a gestação com o ID do usuário
      const resGestacao = await fetch("/api/gestacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: finalUserId,
          nomeGestacao: nomeGestacao,
          semanas: Number(semanas),
          dpp: formattedDpp,
          primeiraGestacao: params.primeiraGestacao === true || params.primeiraGestacao === "true",
          qtdBebes: params.qtdBebes,
          bebes: bebes,
        }),
      });

      const dataGestacao = await resGestacao.json();
      if (resGestacao.ok) {
        // Agora que ambos foram criados com sucesso, salvamos a sessão e vamos pro app
        clearRegistrationData();
        if (!user) {
          signIn(userObj as any);
        }
        if (dataGestacao && dataGestacao.gestacao) {
          setSelectedGestacao(dataGestacao.gestacao);
        } else if (dataGestacao && dataGestacao.id_gestacao) {
          setSelectedGestacao(dataGestacao);
        }
        Alert.alert("Sucesso", "Tudo pronto! Bem-vinda ao seu diário de bordo.");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Erro", dataGestacao.error || "Não foi possível salvar os dados da gestação.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha de conexão com o servidor.");
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
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(auth)/gestacao");
                }
              }}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#A37262" />
              <Text className="text-[#A37262] font-semibold text-sm ml-1.5">
                Voltar
              </Text>
            </TouchableOpacity>

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
                    onValueChange={(val) => {
                      const novosBebes = [...bebes];
                      novosBebes[index].aindaNaoDecidiuNome = val;
                      if (val) novosBebes[index].nome = "";
                      setBebes(novosBebes);
                    }}
                    trackColor={{ false: "#E2EDED", true: "#C56A43" }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* NOME DO BEBÊ */}
                {!bebe.aindaNaoDecidiuNome && (
                  <View className="mb-3">
                    <TextInput
                      value={bebe.nome}
                      onChangeText={(text) => {
                        const novosBebes = [...bebes];
                        novosBebes[index].nome = text;
                        setBebes(novosBebes);
                        if (errors[`bebe_${index}_nome`]) {
                          setErrors(prev => ({ ...prev, [`bebe_${index}_nome`]: "" }));
                        }
                      }}
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
                <View className={`flex-row items-center bg-[#FDF2EE] border ${errors[`bebe_${index}_sexo`] ? 'border-red-400' : 'border-[#FADCD0]'} rounded-2xl p-1 w-full overflow-hidden`}>
                  <TouchableOpacity
                    onPress={() => {
                      const novosBebes = [...bebes];
                      novosBebes[index].sexo = 'masculino';
                      setBebes(novosBebes);
                      if (errors[`bebe_${index}_sexo`]) {
                        setErrors(prev => ({ ...prev, [`bebe_${index}_sexo`]: "" }));
                      }
                    }}
                    activeOpacity={0.8}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      bebe.sexo === 'masculino' ? 'bg-[#C56A43]' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${bebe.sexo === 'masculino' ? 'text-white' : 'text-[#8A7A75]'}`}>Menino</Text>
                  </TouchableOpacity>

                  {/* Divisória Vertical */}
                  <View className={`w-[1px] h-6 bg-[#FADCD0] mx-1 ${bebe.sexo !== 'nao_informado' ? 'opacity-0' : 'opacity-100'}`} />

                  <TouchableOpacity
                    onPress={() => {
                      const novosBebes = [...bebes];
                      novosBebes[index].sexo = 'feminino';
                      setBebes(novosBebes);
                      if (errors[`bebe_${index}_sexo`]) {
                        setErrors(prev => ({ ...prev, [`bebe_${index}_sexo`]: "" }));
                      }
                    }}
                    activeOpacity={0.8}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      bebe.sexo === 'feminino' ? 'bg-[#C56A43]' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${bebe.sexo === 'feminino' ? 'text-white' : 'text-[#8A7A75]'}`}>Menina</Text>
                  </TouchableOpacity>

                  {/* Divisória Vertical */}
                  <View className={`w-[1px] h-6 bg-[#FADCD0] mx-1 ${bebe.sexo !== 'nao_informado' ? 'opacity-0' : 'opacity-100'}`} />

                  <TouchableOpacity
                    onPress={() => {
                      const novosBebes = [...bebes];
                      novosBebes[index].sexo = 'nao_informado';
                      setBebes(novosBebes);
                      if (errors[`bebe_${index}_sexo`]) {
                        setErrors(prev => ({ ...prev, [`bebe_${index}_sexo`]: "" }));
                      }
                    }}
                    activeOpacity={0.8}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      bebe.sexo === 'nao_informado' ? 'bg-[#C56A43]' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-[11px] font-bold ${bebe.sexo === 'nao_informado' ? 'text-white' : 'text-[#8A7A75]'}`}>Não sei</Text>
                  </TouchableOpacity>
                </View>
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

      {/* Modal do Calendário */}
      <Modal
        visible={isCalendarVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <BlurView intensity={15} tint="dark" style={{ flex: 1 }}>
          <Pressable
            style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
            className="flex-1 justify-center items-center px-4"
            onPress={() => setIsCalendarVisible(false)}
          >
          <Pressable
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-lg p-3"
            onPress={(e) => e.stopPropagation()}
          >
            <Calendar
              style={{ minHeight: 360 }}
              current={
                dpp && dpp.includes('/')
                  ? (() => {
                      const parts = dpp.replace(/\s/g, '').split('/');
                      return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    })()
                  : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()
              }
              onDayPress={(day: any) => {
                const [ano, mes, dia] = day.dateString.split("-");
                setDpp(`${dia}/${mes}/${ano}`);
                if (errors.dpp) setErrors(prev => ({ ...prev, dpp: "" }));
                setIsCalendarVisible(false);
              }}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#8A7A75",
                selectedDayBackgroundColor: "#C56A43",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#C56A43",
                dayTextColor: "#2C221E",
                textDisabledColor: "#E0D7D3",
                arrowColor: "#8A7A75",
                monthTextColor: "#2C221E",
                indicatorColor: "#C56A43",
                textDayFontWeight: "bold",
                textMonthFontWeight: "800",
                textDayHeaderFontWeight: "700",
                textDayFontSize: 13,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 11,
              }}
            />
          </Pressable>
          </Pressable>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
