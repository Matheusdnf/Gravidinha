import { Feather, Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FullScreenModal } from "../../components/FullScreenModal";
import { DiaryItemSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../state/auth";
import { criarDiario, listarDiario } from "../../lib/dados";
import { useDadosAtualizados } from "../../lib/sync";
import { hojeISO, parseData } from "../../lib/gestacao";
import { BackButton } from "../../components/BackButton";

import { DiarioEntry } from "../../types/diario";
import { HUMOR_OPTIONS } from "../../constants/humores";
import { useCores } from "../../lib/tema";

const POR_PAGINA = 20;

export default function DiarioScreen() {
  const cores = useCores();
  const { user, selectedGestacao } = useAuth();

  // Estados locais do formulário
  const [selectedHumorId, setSelectedHumorId] = useState<string>("1");
  const [textoRegistro, setTextoRegistro] = useState<string>("");
  const [registros, setRegistros] = useState<DiarioEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiarioEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // Renderiza em lotes: a lista cresce a gestação inteira e fica dentro de um ScrollView
  const [visiveis, setVisiveis] = useState(POR_PAGINA);

  // Data atual formatada (ex: 10 de agosto de 2026) para display
  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const fetchDiarios = async () => {
    if (!user?.id || !selectedGestacao?.id_gestacao) {
      setIsInitialLoading(false);
      return;
    }
    setIsInitialLoading(true);
    try {
      const diarios = await listarDiario(selectedGestacao.id_gestacao);
      const formatados = diarios.map((d: any) => {
        const humorRef = HUMOR_OPTIONS.find(h => h.id === d.reacao) || HUMOR_OPTIONS[0];
        // 'YYYY-MM-DD' interpretado no fuso local
        const dateObj = parseData(d.data);
        const dataStr = dateObj.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        return {
          id: d.id_diario,
          humor: humorRef,
          data: dataStr,
          hora: d.hora,
          texto: d.descricao,
        };
      });
      // Já vem ordenado (data DESC, hora DESC)

      setRegistros(formatados);
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    setVisiveis(POR_PAGINA);
    fetchDiarios();
  }, [user?.id, selectedGestacao?.id_gestacao]);
  useDadosAtualizados(fetchDiarios);

  const handleSalvar = async () => {
    if (!textoRegistro.trim()) return;

    setIsLoading(true);
    try {
      const d = new Date();
      const horaStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      await criarDiario({
        id_gestacao: selectedGestacao?.id_gestacao,
        data: hojeISO(),
        hora: horaStr,
        reacao: selectedHumorId,
        descricao: textoRegistro
      });

      Alert.alert("Sucesso", "Registro salvo no diário!");
      setTextoRegistro("");
      fetchDiarios();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fundo items-center">
      <View className="w-full max-w-xl flex-1 px-5 relative overflow-hidden">
        {/* Círculo Orgânico Decorativo */}
        <View className="absolute top-[-40px] right-[-20px] w-48 h-48 rounded-full bg-areia opacity-70 pointer-events-none" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Botão Voltar */}
          <BackButton fallback="/(tabs)" />

          {/* Cabeçalho */}
          <Text className="text-3xl font-extrabold text-texto tracking-tight">
            Meu Diário
          </Text>
          <Text className="text-sm font-medium text-texto-suave mt-1 mb-6">
            {dataHoje}
          </Text>

          {/* CARD DE CRIAÇÃO DO REGISTRO - Oculto se não houver gestação ativa */}
          {selectedGestacao && (!selectedGestacao.status || selectedGestacao.status === 'ativa') && (
            <View className="bg-cartao border border-borda rounded-3xl p-5 mb-8 w-full">
              <Text className="text-sm font-bold text-texto mb-4">
                Como você está se sentindo hoje?
              </Text>

              {/* Carrossel/Fileira de Sentimentos */}
              <View className="flex-row flex-wrap justify-center mb-5 w-full">
                {HUMOR_OPTIONS.map((humor) => {
                  const isSelected = selectedHumorId === humor.id;
                  return (
                    <TouchableOpacity
                      key={humor.id}
                      onPress={() => setSelectedHumorId(humor.id)}
                      className={`w-14 h-14 rounded-2xl items-center justify-center border shrink-0 mx-3 my-2 ${
                        isSelected
                          ? "bg-pessego border-pessego-borda"
                          : "bg-suave border-transparent"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text style={{
                        fontSize: 28,
                        lineHeight: 34,
                        textAlign: 'center',
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                      }}>{humor.emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Campo de Texto */}
              <View className="bg-pessego border border-pessego-borda rounded-2xl p-4 mb-2">
                <TextInput
                  value={textoRegistro}
                  onChangeText={setTextoRegistro}
                  placeholder="Escreva aqui seus pensamentos, sentimentos, sintomas ou qualquer coisa que queira guardar de hoje..."
                  placeholderTextColor={cores.textoFraco}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="text-sm text-texto min-h-[100px] p-0 leading-relaxed"
                />
              </View>

              {/* Contador de Caracteres */}
              <Text className="text-[11px] text-marrom font-medium mb-5">
                {textoRegistro.length} caracteres
              </Text>

              {/* Botão Salvar Registro */}
              <TouchableOpacity
                onPress={handleSalvar}
                disabled={isLoading}
                className="bg-[#D97D54] active:bg-[#C56A43] rounded-2xl py-3.5 flex-row items-center justify-center shadow-sm"
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Feather name="save" size={16} color="#FFF" />
                    <Text className="text-white font-extrabold text-sm ml-2">
                      Salvar Registro
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* SEÇÃO REGISTROS ANTERIORES */}
          <View className="flex-row justify-between items-center mb-4 w-full">
            <Text className="text-lg font-bold text-texto">
              Registros Anteriores
            </Text>
            <Text className="text-xs font-semibold text-texto-suave">
              {registros.length} entradas
            </Text>
          </View>

          {/* Lista de Entradas Passadas */}
          {isInitialLoading ? (
            <View className="w-full">
              {[1, 2, 3].map((i) => (
                <DiaryItemSkeleton key={i} />
              ))}
            </View>
          ) : registros.length === 0 ? (
            <View className="bg-cartao border border-borda rounded-3xl p-6 items-center w-full">
              <Ionicons name="journal-outline" size={40} color="#D97D54" />
              <Text className="text-texto font-bold text-center mt-3">
                Nenhum registro ainda
              </Text>
              <Text className="text-texto-suave text-xs text-center mt-1">
                Como você está se sentindo hoje?
              </Text>
            </View>
          ) : (
            registros.slice(0, visiveis).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedEntry(item)}
                className="bg-cartao border border-borda rounded-3xl p-5 mb-4 w-full"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-pessego border border-pessego-borda w-14 h-14 rounded-2xl items-center justify-center mr-4 shrink-0">
                      <Text className="text-2xl pr-1 overflow-visible">{item.humor.emoji}</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-[#C56A43]">
                        {item.humor.label}
                      </Text>
                      <Text className="text-[11px] text-texto-suave font-medium mt-0.5">
                        {item.data}{item.hora ? ` às ${item.hora}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={cores.bordaForte} />
                </View>

                <Text
                  className="text-xs text-texto-2 leading-relaxed font-medium"
                  numberOfLines={3}
                >
                  {item.texto}
                </Text>
              </TouchableOpacity>
            ))
          )}
          {!isInitialLoading && registros.length > visiveis && (
            <TouchableOpacity
              onPress={() => setVisiveis((v) => v + POR_PAGINA)}
              className="py-3 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold text-[#C56A43]">Ver registros anteriores</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* ================= MODAL PARA VER DIÁRIO COMPLETO ================= */}
      <FullScreenModal
        visible={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        animationType="fade"
      >
          <Pressable
            style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
            onPress={() => setSelectedEntry(null)}
          >
            <Pressable
              style={{ backgroundColor: cores.cartao, boxShadow: "0 0 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: 576, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: cores.borda }}
              onPress={(e) => e.stopPropagation()}
            >
            {selectedEntry && (
              <>
                <View className="flex-row items-center justify-between mb-6">
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="bg-pessego border border-pessego-borda w-16 h-16 rounded-2xl items-center justify-center mr-4 shrink-0">
                      <Text className="text-3xl pr-1 overflow-visible">{selectedEntry.humor.emoji}</Text>
                    </View>
                    <View>
                      <Text className="text-lg font-extrabold text-[#C56A43]">
                        {selectedEntry.humor.label}
                      </Text>
                      <Text className="text-xs text-texto-suave font-medium mt-0.5">
                        {selectedEntry.data}{selectedEntry.hora ? ` às ${selectedEntry.hora}` : ''}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedEntry(null)}
                    className="w-8 h-8 rounded-full bg-creme/60 items-center justify-center"
                  >
                    <Ionicons name="close" size={18} color={cores.texto} />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-texto-2 leading-relaxed font-medium">
                  {selectedEntry.texto}
                </Text>
              </>
            )}
            </Pressable>
          </Pressable>
      </FullScreenModal>
    </SafeAreaView>
  );
}
