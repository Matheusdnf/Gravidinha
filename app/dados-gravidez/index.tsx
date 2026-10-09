import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../state/auth";
import { clearRegistrationData } from "../../state/registrationStore";
import { BottomSheetModal } from "../../components/BottomSheetModal";
import { CalendarModal } from "../../components/CalendarModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { calcularSemanaAtual, getTrimestre, isoParaBR, parseData } from "../../lib/gestacao";
import { BackButton } from "../../components/BackButton";
import { SexoSelector } from "../../components/SexoSelector";
import { atualizarGestacao, listarGestacoes } from "../../lib/dados";


export default function DadosGravidezScreen() {
  const router = useRouter();
  const { user, selectedGestacao, setSelectedGestacao } = useAuth();
  const [gestacoes, setGestacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modais Customizados
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [gestacaoParaFinalizar, setGestacaoParaFinalizar] = useState<any>(null);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectGestacaoModalVisible, setSelectGestacaoModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGestacao, setEditingGestacao] = useState<any>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const fetchGestacoes = () => {
    setLoading(true);
    listarGestacoes()
      .then((data) => {
        setGestacoes(data);
        if (data.length > 0) {
          if (selectedGestacao) {
            const updatedSelected = data.find((g: any) => g.id_gestacao === selectedGestacao.id_gestacao);
            if (updatedSelected) {
              setSelectedGestacao(updatedSelected);
            }
          } else {
            const ativa = data.find((g: any) => !g.status || g.status === 'ativa') || data[0];
            setSelectedGestacao(ativa);
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.id) {
      fetchGestacoes();
    }
  }, [user?.id]);

  const openEditModal = (gestacao: any) => {
    setEditingGestacao(JSON.parse(JSON.stringify(gestacao)));
    setEditModalVisible(true);
  };

  const atualizarFilho = (id_filho: string, patch: { nome?: string; sexo?: string }) => {
    setEditingGestacao((prev: any) => ({
      ...prev,
      filhos: prev.filhos.map((f: any) => (f.id_filho === id_filho ? { ...f, ...patch } : f)),
    }));
  };

  const saveGestacao = async () => {
    setSaving(true);
    try {
      await atualizarGestacao({
        id_gestacao: editingGestacao.id_gestacao,
        nome: editingGestacao.nome,
        semanas: editingGestacao.semanas,
        dpp: editingGestacao.dpp,
        filhos: editingGestacao.filhos,
      });
      Alert.alert("Sucesso", "Informações atualizadas!");
      setEditModalVisible(false);
      fetchGestacoes();
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  const executeFinalizarGestacao = async () => {
    if (!gestacaoParaFinalizar) return;
    setLoading(true);
    setConfirmModalVisible(false);
    try {
      await atualizarGestacao({ ...gestacaoParaFinalizar, status: 'finalizada' });
      if (Platform.OS === 'web') window.alert("Gestação finalizada com sucesso!");
      else Alert.alert("Sucesso", "Gestação finalizada com sucesso!");
      fetchGestacoes();
    } catch (err) {
      if (Platform.OS === 'web') window.alert("Não foi possível finalizar a gestação.");
      else Alert.alert("Erro", "Não foi possível finalizar a gestação.");
    } finally {
      setLoading(false);
      setGestacaoParaFinalizar(null);
    }
  };

  const handleFinalizarGestacao = (gestacao: any) => {
    setGestacaoParaFinalizar(gestacao);
    setConfirmModalVisible(true);
  };


  const renderDataRow = (
    icon: string,
    label: string,
    value: string,
    rowKey?: string,
  ) => (
    <View key={rowKey} className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 rounded-full bg-[#FDF2EE] items-center justify-center mr-3">
          <MaterialCommunityIcons
            name={icon as any}
            size={16}
            color="#D97D54"
          />
        </View>
        <Text className="text-[14px] font-bold text-[#2C221E] flex-1 pr-2">
          {label}
        </Text>
      </View>
      <Text className="text-[13px] font-medium text-[#8A7A75] text-right shrink-0 max-w-[50%]">
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center relative overflow-hidden">
      {/* Decoração orgânica fundo */}
      <View className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-[#F3E2D4] opacity-70 pointer-events-none" />

      <View className="w-full max-w-xl flex-1 px-6 overflow-hidden">
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Botão Voltar */}
          <BackButton fallback="/(tabs)/perfil" className="mb-6" />

          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity 
              activeOpacity={gestacoes.length > 1 ? 0.7 : 1}
              onPress={() => gestacoes.length > 1 && setSelectGestacaoModalVisible(true)}
              className="flex-row items-center flex-1 pr-2"
            >
              <Text className="text-3xl font-extrabold text-[#2C221E] tracking-tight" numberOfLines={1}>
                {selectedGestacao?.nome || "Minhas Gestações"}
              </Text>
            </TouchableOpacity>

            {gestacoes.length > 1 && (
              <TouchableOpacity
                onPress={() => setSelectGestacaoModalVisible(true)}
                className="w-10 h-10 items-center justify-center rounded-full bg-white border border-[#F0EBE6] shadow-sm ml-2"
              >
                <Feather name="more-vertical" size={20} color="#8A7A75" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-sm font-medium text-[#8A7A75] mb-6 leading-relaxed">
            Aqui você encontra e gerencia o seu histórico de gestações no aplicativo.
          </Text>

          {/* Estado de loading/erro */}
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#D97D54" />
              <Text className="text-[#8A7A75] mt-4 font-bold text-sm">
                Buscando informações...
              </Text>
            </View>
          ) : error ? (
            <View className="py-10 items-center justify-center bg-white rounded-3xl border border-red-100 p-6">
              <Ionicons name="alert-circle" size={40} color="#E25C5C" />
              <Text className="text-center text-[#E25C5C] font-bold mt-3">
                {error}
              </Text>
            </View>
          ) : gestacoes.length === 0 ? (
            <View className="py-12 items-center justify-center bg-white rounded-3xl border border-[#F0EBE6] p-6 shadow-sm">
              <MaterialCommunityIcons
                name="baby-carriage"
                size={48}
                color="#C2B2AC"
              />
              <Text className="text-center text-[#8A7A75] font-bold mt-4 text-base">
                Nenhuma gestação encontrada
              </Text>
            </View>
          ) : (
            <View>
              {/* O Menu de Seleção Horizontal foi substituído pelo cabeçalho minimalista */}

              {/* Visualização de apenas UMA gestação (a selecionada) */}
              {selectedGestacao && (
                (() => {
                  // Find the fully populated object from gestacoes to ensure we have the latest data (e.g. filhos)
                  const gestacao = gestacoes.find(g => g.id_gestacao === selectedGestacao.id_gestacao) || selectedGestacao;
                  const semanaAtual = calcularSemanaAtual(
                    gestacao.semanas || 0,
                    gestacao.data_inicio,
                    gestacao.data_finalizacao
                  );

                  return (
                    <View key={gestacao.id_gestacao} className="mb-6">
                      {/* ================= CARD TERRACOTA DESTACADO ================= */}
                      <View className="bg-[#D97D54] rounded-[32px] p-6 mb-4 relative overflow-hidden shadow-md">
                        {/* Círculo com gradiente/iluminação interna no canto do card */}
                        <View className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                        
                        <View className="flex-row justify-between items-start mb-4">
                          {/* Lado Esquerdo: Semana Atual e Trimestre */}
                          <View className="flex-1">
                            <Text className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                              SEMANA ATUAL
                            </Text>
                            <Text className="text-4xl font-extrabold text-white leading-none mb-2">
                              {semanaAtual}
                            </Text>
                            <View className="bg-white/20 self-start px-3 py-1 rounded-full border border-white/20">
                              <Text className="text-[10px] font-bold text-white uppercase tracking-widest">
                                {getTrimestre(semanaAtual)}
                              </Text>
                            </View>
                          </View>

                          {/* Lado Direito: Data Provável do Parto e Status */}
                          <View className="flex-1 pl-2 items-end">
                            <View className="w-full">
                              <Text className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                                DATA PROVÁVEL DO PARTO
                              </Text>
                              <Text className="text-lg font-bold text-white leading-snug mb-2">
                                {gestacao.dpp
                                  ? parseData(gestacao.dpp).toLocaleDateString(
                                      "pt-BR",
                                      {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      },
                                    )
                                  : "A definir"}
                              </Text>
                              {gestacao.status === 'finalizada' && (
                                <View className="bg-white/20 self-start px-3 py-1 rounded-full border border-white/30">
                                  <Text className="text-[10px] font-bold text-white uppercase tracking-widest">Finalizada</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>

                        {/* Rodapé do Card: Nome dos Bebês */}
                        {gestacao.filhos && gestacao.filhos.length > 0 && (
                          <View className="mt-2 pt-2 border-t border-white/10">
                            {gestacao.filhos.map((filho: any, idx: number) => {
                              const nomeAExibir = filho.nome ? filho.nome : "Bebê";
                              return (
                                <View key={filho.id_filho || idx} className="flex-row items-center mt-1">
                                  <Text className="text-base mr-2">👶</Text>
                                  <Text className="text-sm font-bold text-white">
                                    {nomeAExibir}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>

                      {/* ================= DETALHES COMPLEMENTARES DA GESTAÇÃO ================= */}
                      <View className="bg-white border border-[#F0EBE6] rounded-3xl overflow-hidden shadow-sm">
                        {/* Card Header */}
                        <View className="bg-[#FDF2EE] px-5 py-4 border-b border-[#FADCD0] flex-row justify-between items-center">
                          <View className="flex-1">
                            <Text className="text-lg font-extrabold text-[#C56A43]">
                              {gestacao.nome || "Minha Gestação"}
                            </Text>
                            <View className="flex-row items-center mt-1">
                              <MaterialCommunityIcons
                                name="calendar-range"
                                size={14}
                                color="#D97D54"
                              />
                              <Text className="text-[11px] font-bold text-[#D97D54] ml-1 uppercase tracking-wider">
                                Início:{" "}
                                {gestacao.data_inicio
                                  ? parseData(gestacao.data_inicio).toLocaleDateString("pt-BR")
                                  : "N/A"}
                              </Text>
                            </View>
                          </View>

                          {gestacao.status !== 'finalizada' && (
                            <TouchableOpacity
                              onPress={() => openEditModal(gestacao)}
                              className="w-10 h-10 rounded-full bg-white border border-[#FADCD0] items-center justify-center shadow-sm"
                            >
                              <Feather name="edit-2" size={16} color="#C56A43" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Card Body */}
                        <View className="p-5">
                          {renderDataRow(
                            "clock-outline",
                            "Semana Informada",
                            `${gestacao.semanas || "--"} semanas`,
                          )}
                          {renderDataRow(
                            "calendar-heart",
                            "Data Provável do Parto (DPP)",
                            gestacao.dpp ? isoParaBR(gestacao.dpp) : "--/--/----",
                          )}
                          {renderDataRow(
                            "star-outline",
                            "Primeira Gestação?",
                            gestacao.primeira_gestacao ? "Sim" : "Não",
                          )}
                          {renderDataRow(
                            "account-multiple-outline",
                            "Quantidade",
                            gestacao.qtd_bebes === "um"
                              ? "Um bebê"
                              : gestacao.qtd_bebes === "gemeos_univitelinos"
                                ? "Gêmeos (Univitelinos)"
                                : gestacao.qtd_bebes === "gemeos_bivitelinos"
                                  ? "Gêmeos (Bivitelinos)"
                                  : gestacao.qtd_bebes === "gemeos"
                                    ? "Gêmeos"
                                    : "Múltiplos",
                          )}

                          {/* Divider */}
                          <View className="w-full h-[1px] bg-[#F0EBE6] my-2" />
                          <Text className="text-[11px] font-bold text-[#C2B2AC] uppercase tracking-wider mt-2 mb-1">
                            Bebês desta gestação
                          </Text>

                          {gestacao.filhos && gestacao.filhos.length > 0 ? (
                            <View className="mt-2">
                              {gestacao.filhos.map((filho: any, i: number) => {
                                const isMenino = filho.sexo === 'masculino';
                                const isMenina = filho.sexo === 'feminino';
                                
                                const bgColor = isMenino ? 'bg-[#EFF6FF]' : isMenina ? 'bg-[#FDF2F8]' : 'bg-[#FDF2EE]';
                                const iconColor = isMenino ? '#3B82F6' : isMenina ? '#EC4899' : '#C56A43';
                                const badgeBg = isMenino ? 'bg-[#DBEAFE]' : isMenina ? 'bg-[#FCE7F3]' : 'bg-[#FADCD0]';
                                const badgeText = isMenino ? 'text-[#1D4ED8]' : isMenina ? 'text-[#BE185D]' : 'text-[#A37262]';
                                const sexoLabel = isMenino ? 'Menino' : isMenina ? 'Menina' : 'Não informado';

                                return (
                                  <TouchableOpacity 
                                    key={filho.id_filho || `f-${i}`} 
                                    activeOpacity={1}
                                    className={`flex-row items-center p-3.5 rounded-2xl border border-white shadow-sm ${bgColor} mb-3`}
                                  >
                                    <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm mr-3">
                                      <MaterialCommunityIcons name="baby-face-outline" size={26} color={iconColor} />
                                    </View>
                                    <View className="flex-1">
                                      <Text className="text-[10px] font-bold text-[#8A7A75] uppercase tracking-wider mb-0.5">
                                        Bebê {i + 1}
                                      </Text>
                                      <Text className="text-sm font-extrabold text-[#2C221E]">
                                        {filho.nome || "Não definido"}
                                      </Text>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-full ${badgeBg}`}>
                                      <Text className={`text-[11px] font-bold ${badgeText}`}>{sexoLabel}</Text>
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          ) : (
                            <Text className="text-sm text-[#8A7A75] font-medium mt-1 italic mb-3">
                              Nenhum filho registrado.
                            </Text>
                          )}

                          {(!gestacao.status || gestacao.status === 'ativa') && (
                            <TouchableOpacity
                              onPress={() => handleFinalizarGestacao(gestacao)}
                              className="w-full bg-red-50 border border-red-100 rounded-xl py-3 mt-4 items-center justify-center shadow-sm"
                            >
                              <Text className="text-red-500 font-bold text-sm">Finalizar Gestação</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })()
              )}
            </View>
          )}

          {!loading && !error && !gestacoes.some(g => !g.status || g.status === 'ativa') && (
            <TouchableOpacity
              onPress={() => {
                clearRegistrationData();
                router.push(`/(auth)/gestacao?jaTeveGestacao=${gestacoes.length > 0}`);
              }}
              className="w-full bg-[#C56A43] rounded-2xl py-4 items-center justify-center shadow-sm mt-2"
            >
              <Text className="font-extrabold text-base text-white">
                Adicionar Nova Gestação
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Modal de Edição */}
      <BottomSheetModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Editar Gestação"
      >
        {editingGestacao && (
          <>
          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            {/* NOME DA GESTAÇÃO */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#2C221E] mb-2">
                Nome / Apelido da Gestação
              </Text>
              <TextInput
                value={editingGestacao.nome}
                onChangeText={(t) =>
                  setEditingGestacao({ ...editingGestacao, nome: t })
                }
                placeholder="Ex: Minha Gestação, Gêmeos 2026..."
                className="bg-white border border-[#E8DFDA] rounded-2xl px-4 py-3.5 text-sm text-[#2C221E]"
              />
            </View>

            {/* SEMANAS */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#2C221E] mb-2">
                Semanas Atuais
              </Text>
              <View className="flex-row items-center justify-between bg-white border border-[#E8DFDA] rounded-2xl p-2 w-full">
                <TouchableOpacity
                  onPress={() => setEditingGestacao({ ...editingGestacao, semanas: Math.max(1, (editingGestacao.semanas || 12) - 1) })}
                  className="w-10 h-10 rounded-xl bg-[#FDF2EE] items-center justify-center"
                >
                  <Text className="text-lg font-bold text-[#C56A43]">-</Text>
                </TouchableOpacity>
                <TextInput
                  keyboardType="numeric"
                  value={String(editingGestacao.semanas || 12)}
                  onChangeText={(t) => {
                    const val = parseInt(t.replace(/[^0-9]/g, ""), 10);
                    if (!isNaN(val)) setEditingGestacao({ ...editingGestacao, semanas: Math.max(1, Math.min(45, val)) });
                  }}
                  className="text-lg font-extrabold text-[#2C221E] text-center w-20 p-0"
                />
                <TouchableOpacity
                  onPress={() => setEditingGestacao({ ...editingGestacao, semanas: Math.min(45, (editingGestacao.semanas || 12) + 1) })}
                  className="w-10 h-10 rounded-xl bg-[#FDF2EE] items-center justify-center"
                >
                  <Text className="text-lg font-bold text-[#C56A43]">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DPP */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#2C221E] mb-2">
                Data Provável do Parto (DPP)
              </Text>
              <TouchableOpacity
                onPress={() => setIsCalendarVisible(true)}
                activeOpacity={0.8}
                className="flex-row items-center justify-between bg-white border border-[#E8DFDA] rounded-2xl px-4 py-3.5"
              >
                <Text className={`flex-1 text-sm ${editingGestacao.dpp ? 'text-[#2C221E]' : 'text-[#C2B2AC]'}`}>
                  {editingGestacao.dpp
                    ? (editingGestacao.dpp.includes('/') ? editingGestacao.dpp : isoParaBR(editingGestacao.dpp))
                    : "dd / mm / aaaa"}
                </Text>
                <Feather name="calendar" size={18} color="#C56A43" />
              </TouchableOpacity>
              <Text className="text-[10px] font-medium text-[#8A7A75] mt-1 ml-1">
                Toque para selecionar a data
              </Text>
            </View>

            {/* NOMES DOS BEBÊS */}
            <Text className="text-[11px] font-bold text-[#C2B2AC] uppercase tracking-wider mt-4 mb-3">
              Dados dos Bebês
            </Text>

            {editingGestacao.filhos?.map((filho: any, idx: number) => (
              <View key={filho.id_filho || idx} className="mb-4 bg-white border border-[#E8DFDA] p-4 rounded-2xl">
                <Text className="text-xs font-bold text-[#2C221E] mb-1.5">
                  Nome do Bebê {idx + 1}
                </Text>
                <TextInput
                  value={filho.nome}
                  onChangeText={(t) => atualizarFilho(filho.id_filho, { nome: t })}
                  placeholder="Nome do bebê"
                  className="bg-[#FBF9F6] border border-[#E8DFDA] rounded-xl px-4 py-3 text-sm text-[#2C221E] mb-3"
                />

                <Text className="text-xs font-bold text-[#2C221E] mb-1.5">
                  Sexo
                </Text>
                <SexoSelector
                  value={filho.sexo}
                  onChange={(sexo) => atualizarFilho(filho.id_filho, { sexo })}
                  bg="#FBF9F6"
                  borda="#E8DFDA"
                />
              </View>
            ))}
          </ScrollView>

          {/* Botão Salvar (Fixo embaixo) */}
          <View className="px-6 py-4 border-t border-[#F0EBE6] bg-white">
            <TouchableOpacity
              onPress={saveGestacao}
              disabled={saving}
              className={`bg-[#C56A43] active:bg-[#B05B35] rounded-2xl py-4 flex-row items-center justify-center shadow-sm ${
                saving ? "opacity-70" : ""
              }`}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-extrabold text-sm ml-2">
                  Salvar Alterações
                </Text>
              )}
            </TouchableOpacity>
          </View>
          </>
        )}
      </BottomSheetModal>

      {/* Modal do Calendário (já existia fade) */}
      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        selectedDate={editingGestacao?.dpp || ""}
        onDayPress={(day: any) => {
          setEditingGestacao({ ...editingGestacao, dpp: isoParaBR(day.dateString) });
          setIsCalendarVisible(false);
        }}
      />

      <ConfirmModal
        visible={confirmModalVisible}
        title="Finalizar Gestação"
        message={`Deseja marcar a gestação "${gestacaoParaFinalizar?.nome}" como finalizada? Ela ficará salva no seu histórico.`}
        confirmText="Sim, finalizar"
        cancelText="Não"
        onConfirm={executeFinalizarGestacao}
        onCancel={() => setConfirmModalVisible(false)}
      />

      {/* Modal Minimalista de Seleção de Gestação */}
      <BottomSheetModal
        visible={selectGestacaoModalVisible}
        onClose={() => setSelectGestacaoModalVisible(false)}
        title="Selecionar Gestação"
      >
        <View className="pb-6 px-1">
          {gestacoes.map((g, idx) => {
            const isSelected = selectedGestacao?.id_gestacao === g.id_gestacao;
            return (
              <TouchableOpacity
                key={g.id_gestacao || idx}
                onPress={() => {
                  setSelectedGestacao(g);
                  setSelectGestacaoModalVisible(false);
                }}
                className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${
                  isSelected ? 'bg-[#FDF2EE] border-[#FADCD0]' : 'bg-white border-[#F0EBE6]'
                }`}
              >
                <Text className={`text-base font-bold ${isSelected ? 'text-[#C56A43]' : 'text-[#2C221E]'}`}>
                  {g.nome || `Gestação ${idx + 1}`}
                </Text>
                {isSelected && <Feather name="check" size={20} color="#C56A43" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
