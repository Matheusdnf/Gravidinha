import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { createElement } from "react";
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../state/auth";
import { BottomSheetModal } from "../../components/BottomSheetModal";
import { CalendarModal, Calendario } from "../../components/CalendarModal";
import { CalendarSkeleton, AppointmentItemSkeleton } from "../../components/Skeleton";

import { Appointment } from "../../types/consultas";
import { atualizarConsulta, criarConsulta, excluirConsulta, listarConsultas } from "../../lib/dados";
import { useDadosAtualizados } from "../../lib/sync";
import { hojeISO, isoParaBR, parseData } from "../../lib/gestacao";
import { BackButton } from "../../components/BackButton";
import { useCores } from "../../lib/tema";

// Fora do componente: se fosse criado dentro, seria um tipo novo a cada render
// e o <input> remontaria (perdendo o foco) a cada tecla
const WebDateInput = (props: any) => createElement('input', props);

export default function ConsultasScreen() {
  const cores = useCores();
  const { user, selectedGestacao } = useAuth();

  // Estados
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dialogAndroidAberto, setDialogAndroidAberto] = useState(false);
  // Um modal por vez: calendário/relógio abertos por cima do formulário travam no Android,
  // então o formulário some enquanto o seletor está aberto (os campos ficam no estado da tela).
  const formEscondido = isCalendarVisible || showTimePicker || dialogAndroidAberto;

  const isWeb = Platform.OS === 'web';
  const todayISO = hojeISO();

  // Campos do Formulário
  const [tipoConsulta, setTipoConsulta] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [medico, setMedico] = useState("");
  const [local, setLocal] = useState("");

  const fetchConsultas = async () => {
    if (!user?.id || !selectedGestacao?.id_gestacao) {
      setIsInitialLoading(false);
      return;
    }
    setIsInitialLoading(true);
    try {
      const consultas = await listarConsultas(selectedGestacao.id_gestacao);
      const formatadas = consultas.map((c: any) => {
        const dateObj = parseData(c.data);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        const month = months[dateObj.getMonth()];
        return {
          id: c.id_consulta,
          day: day,
          month: month,
          title: c.descricao,
          doctor: c.medico ? c.medico : "Médico(a)",
          time: c.horario ? c.horario.substring(0, 5) : "--:--",
          location: c.local,
          rawDate: c.data
        };
      });
      setAppointments(formatadas);
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultas();
  }, [user?.id, selectedGestacao?.id_gestacao]);
  useDadosAtualizados(fetchConsultas);

  const openEditModal = (item: Appointment) => {
    setSelectedAppointmentId(item.id);
    setTipoConsulta(item.title);
    setData(item.rawDate ? isoParaBR(item.rawDate) : "");
    setHorario(item.time !== "--:--" ? item.time : "");
    setMedico(item.doctor !== "Médico(a)" ? item.doctor : "");
    setLocal(item.location || "");
    setIsEditModalVisible(true);
  };

  const resetForm = () => {
    setTipoConsulta("");
    setData("");
    setHorario("");
    setMedico("");
    setLocal("");
    setSelectedAppointmentId(null);
  };

  // Android: o componente <DateTimePicker> reabre o diálogo a cada render (value={new Date()} muda sempre),
  // então abrimos pela API imperativa, uma vez só.
  const abrirSeletorDeHora = () => {
    if (Platform.OS !== 'android') return setShowTimePicker(true);
    const [h, m] = horario.split(':').map(Number);
    const valor = new Date();
    if (!isNaN(h) && !isNaN(m)) valor.setHours(h, m, 0, 0);
    setDialogAndroidAberto(true);
    DateTimePickerAndroid.open({
      value: valor,
      mode: 'time',
      is24Hour: true,
      onValueChange: (e, d) => { setDialogAndroidAberto(false); handleTimeChange(e, d); },
      onDismiss: () => setDialogAndroidAberto(false),
    });
  };

  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hh = String(selectedDate.getHours()).padStart(2, '0');
      const mm = String(selectedDate.getMinutes()).padStart(2, '0');
      setHorario(`${hh}:${mm}`);
    }
  };

  // Valida o formulário; devolve null (e avisa) se faltar campo obrigatório
  const dadosDoForm = () => {
    if (!tipoConsulta.trim() || !data.trim()) {
      Alert.alert("Atenção", "Preencha o tipo de consulta e a data.");
      return null;
    }
    return {
      data,
      consulta: tipoConsulta,
      horario: horario.trim() || "10:00",
      local: local.trim() || "A definir",
      medico: medico.trim(),
    };
  };

  const handleEditarConsulta = async () => {
    const form = dadosDoForm();
    if (!form) return;

    setIsLoading(true);
    try {
      await atualizarConsulta(selectedAppointmentId!, form);

      Alert.alert("Sucesso", "Consulta atualizada com sucesso!");
      resetForm();
      setIsEditModalVisible(false);
      fetchConsultas();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletarConsulta = async () => {
    Alert.alert(
      "Excluir Consulta",
      "Tem certeza que deseja excluir esta consulta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await excluirConsulta(selectedAppointmentId!);

              Alert.alert("Sucesso", "Consulta excluída!");
              resetForm();
              setIsEditModalVisible(false);
              fetchConsultas();
            } catch (error: any) {
              Alert.alert("Erro", error.message);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Adicionar Nova Consulta
  const handleSalvarConsulta = async () => {
    const form = dadosDoForm();
    if (!form) return;

    setIsLoading(true);
    try {
      await criarConsulta(selectedGestacao?.id_gestacao, form);

      Alert.alert("Sucesso", "Consulta agendada com sucesso!");
      
      // --- INÍCIO DA INTEGRAÇÃO DE NOTIFICAÇÕES ---
      try {
        const { scheduleLocalNotification } = require("../../lib/notifications");
        const [day, month, year] = data.split('/');
        const [hour, minute] = form.horario.split(':');
        
        // Data exata da consulta
        const appointmentDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
        
        // Data de término (1 hora depois por padrão)
        const appointmentEndDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
        
        // Notificação: 1 dia antes
        const dayBefore = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
        if (dayBefore > new Date()) {
          scheduleLocalNotification(
            "Consulta Amanhã!",
            `Lembrete: você tem ${tipoConsulta} amanhã às ${hour}:${minute}.`,
            dayBefore
          );
        }
        
        // --- INTEGRAÇÃO COM GOOGLE CALENDAR / APPLE CALENDAR ---
        try {
          const { addEventToCalendar } = require("../../lib/calendar");
          await addEventToCalendar(
            `Consulta: ${tipoConsulta}`, // Titulo
            appointmentDate,             // Inicio
            appointmentEndDate,          // Fim (1h depois)
            form.local, // Local
            `Médico(a): ${medico.trim() || "Não informado"}\nAgendado pelo app Gravidinha.` // Notas
          );
        } catch (calErr) {
          console.log("Erro ao salvar no calendário silencioso:", calErr);
        }
        
        // Notificação: 1 hora antes
        const hourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
        if (hourBefore > new Date()) {
          scheduleLocalNotification(
            "Sua consulta é em 1 hora!",
            `Prepare-se para: ${tipoConsulta}.`,
            hourBefore
          );
        }
      } catch (e) {
        console.error("Erro ao agendar notificação:", e);
      }
      // --- FIM DA INTEGRAÇÃO DE NOTIFICAÇÕES ---

      resetForm();
      setIsModalVisible(false);
      fetchConsultas(); // recarrega a lista
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepara as marcações de datas no calendário (Bolotas de dias selecionados e pontinhos de consultas)
  const diasComConsulta = new Set(appointments.flatMap((app) => app.rawDate ?? []));

  const appointmentsToShow = selectedDate 
    ? appointments.filter(app => app.rawDate === selectedDate)
    : appointments;

  // Campos comuns aos modais de adicionar e editar
  const camposDoForm = (
    <>
      <View className="mb-4">
        <Text className="text-xs font-bold text-texto mb-2">
          Tipo de Consulta / Exame *
        </Text>
        <TextInput
          value={tipoConsulta}
          onChangeText={setTipoConsulta}
          placeholder="Ex: Consulta Pré-natal, Ultrassom..."
          placeholderTextColor={cores.textoFraco}
          className="bg-pessego border border-pessego-borda rounded-2xl px-4 py-3.5 text-sm text-texto"
        />
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="w-[48%]">
          <Text className="text-xs font-bold text-texto mb-2">
            Data *
          </Text>
          <TouchableOpacity
            onPress={() => setIsCalendarVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center bg-pessego border border-pessego-borda rounded-2xl px-4 py-3.5 h-12"
          >
            <Text className={`flex-1 text-sm ${data ? 'text-texto' : 'text-texto-fraco'}`}>
              {data || "dd/mm/aaaa"}
            </Text>
            <Feather name="calendar" size={16} color="#C56A43" />
          </TouchableOpacity>
        </View>

        <View className="w-[48%]">
          <Text className="text-xs font-bold text-texto mb-2">
            Horário
          </Text>
          <View className="bg-pessego border border-pessego-borda rounded-2xl px-4 py-3.5 h-12 justify-center">
            {isWeb ? (
              <WebDateInput
                type="time"
                value={horario}
                onChange={(e: any) => setHorario(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: cores.texto, cursor: 'pointer' }}
              />
            ) : (
              <TouchableOpacity onPress={abrirSeletorDeHora} className="w-full">
                <Text className={`text-sm ${horario ? 'text-texto' : 'text-texto-fraco'}`}>
                  {horario || "10:00"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-xs font-bold text-texto mb-2">
          Médico / Especialista
        </Text>
        <TextInput
          value={medico}
          onChangeText={setMedico}
          placeholder="Nome do médico"
          placeholderTextColor={cores.textoFraco}
          className="bg-pessego border border-pessego-borda rounded-2xl px-4 py-3.5 text-sm text-texto"
        />
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-texto mb-2">
          Local / Clínica
        </Text>
        <TextInput
          value={local}
          onChangeText={setLocal}
          placeholder="Nome da clínica ou laboratório"
          placeholderTextColor={cores.textoFraco}
          className="bg-pessego border border-pessego-borda rounded-2xl px-4 py-3.5 text-sm text-texto"
        />
      </View>

    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-fundo items-center overflow-hidden">
      <View className="w-full max-w-xl flex-1 px-5 relative overflow-hidden">
        {/* Círculo Orgânico Decorativo */}
        <View className="absolute top-[-40px] right-[-20px] w-48 h-48 rounded-full bg-areia opacity-70 pointer-events-none" />
        <ScrollView
          className="w-full"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100, flexGrow: 1 }}
        >
          {/* Botão Voltar */}
          <BackButton fallback="/(tabs)" />

          {/* Cabeçalho */}
          <Text className="text-3xl font-extrabold text-texto tracking-tight">
            Agenda de Consultas
          </Text>
          <Text className="text-sm font-medium text-texto-suave mt-1 mb-6">
            {appointments.length} {appointments.length === 1 ? 'consulta agendada' : 'consultas agendadas'} no total
          </Text>

          {/* Calendário com um ponto nos dias que têm consulta */}
          {isInitialLoading ? (
            <CalendarSkeleton />
          ) : (
            <View className="bg-cartao border border-borda rounded-3xl p-3 mb-8 w-full overflow-hidden">
              <Calendario
                selectedDate={selectedDate}
                marcados={diasComConsulta}
                onDayPress={(day) => {
                  if (selectedDate === day.dateString) {
                    setSelectedDate(null); // Desmarca se clicar de novo
                  } else {
                    setSelectedDate(day.dateString);
                  }
                  // Preenche automaticamente o campo de data do modal no formato dd/mm/aaaa
                  setData(isoParaBR(day.dateString));
                }}
              />
            </View>
          )}

          {/* LISTA DE CONSULTAS */}
          <Text className="text-lg font-bold text-texto mb-4">
            {selectedDate ? "Consultas do Dia" : "Todas as Consultas"}
          </Text>

          {isInitialLoading ? (
            <View className="w-full">
              {[1, 2].map((i) => (
                <AppointmentItemSkeleton key={i} />
              ))}
            </View>
          ) : appointmentsToShow.length > 0 ? (
            appointmentsToShow.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-cartao border border-borda rounded-3xl p-4 mb-4 flex-row items-center w-full"
                activeOpacity={0.8}
                onPress={() => openEditModal(item)}
              >
                <View className="bg-pessego border border-pessego-borda w-14 h-14 rounded-2xl items-center justify-center mr-4 shrink-0">
                  <Text className="text-lg font-extrabold text-[#C56A43] leading-none">
                    {item.day}
                  </Text>
                  <Text className="text-[10px] font-bold text-[#C56A43] uppercase mt-0.5">
                    {item.month}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-texto mb-1">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <FontAwesome5 name="stethoscope" size={11} color={cores.marrom} />
                    <Text className="text-xs text-texto-suave font-medium ml-1.5">
                      {item.doctor}
                    </Text>
                  </View>

                  <View className="flex-row items-center flex-wrap">
                    <View className="flex-row items-center mr-3">
                      <Feather name="clock" size={11} color={cores.marrom} />
                      <Text className="text-xs text-texto-suave font-medium ml-1">
                        {item.time}
                      </Text>
                    </View>
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={cores.marrom}
                      />
                      <Text className="text-xs text-texto-suave font-medium ml-0.5 flex-1" numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View className="ml-2 pl-2 border-l border-borda justify-center shrink-0">
                  <Feather name="edit-2" size={16} color={cores.marrom} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-cartao border border-borda rounded-3xl p-6 mb-4 items-center justify-center">
              <Text className="text-sm font-medium text-texto-suave text-center">
                {selectedDate 
                  ? "Nenhuma consulta ou exame agendado para esta data."
                  : "Nenhuma consulta agendada ainda."}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* BOTÃO FLUTUANTE PARA ABRIR O MODAL - Oculto se não houver gestação ativa */}
        {selectedGestacao && (!selectedGestacao.status || selectedGestacao.status === 'ativa') && (
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            className="absolute bottom-6 right-5 bg-[#D97D54] active:bg-[#C56A43] px-5 py-3.5 rounded-2xl flex-row items-center shadow-md"
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text className="text-white font-extrabold text-sm ml-1.5">
              Nova Consulta
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MODAL DE NOVA CONSULTA */}
      <BottomSheetModal
        visible={isModalVisible && !formEscondido}
        onClose={() => setIsModalVisible(false)}
        title="Adicionar Consulta"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {camposDoForm}

          <TouchableOpacity
            onPress={handleSalvarConsulta}
            disabled={isLoading}
            className="bg-[#D97D54] active:bg-[#C56A43] rounded-2xl py-4 items-center justify-center shadow-sm mt-2"
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-base">
                Salvar Consulta
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetModal>

      {/* MODAL DE EDITAR CONSULTA */}
      <BottomSheetModal
        visible={isEditModalVisible && !formEscondido}
        onClose={() => {
          setIsEditModalVisible(false);
          resetForm();
        }}
        title="Editar Consulta"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {camposDoForm}

          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              onPress={handleDeletarConsulta}
              disabled={isLoading}
              className="bg-vermelho border border-vermelho-borda rounded-2xl py-4 items-center justify-center shadow-sm flex-1 mr-2"
              activeOpacity={0.9}
            >
              <Text className="text-red-500 font-extrabold text-base">
                Excluir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEditarConsulta}
              disabled={isLoading}
              className="bg-[#C56A43] active:bg-[#B05B35] rounded-2xl py-4 items-center justify-center shadow-sm flex-1 ml-2"
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-extrabold text-base">
                  Salvar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetModal>

      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        selectedDate={data || todayISO}
        onDayPress={(day: any) => {
          setData(isoParaBR(day.dateString));
          setIsCalendarVisible(false);
        }}
      />

      {/* COMPONENTE NATIVO DE SELEÇÃO DE HORA */}
      {showTimePicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onValueChange={handleTimeChange}
          onDismiss={() => setShowTimePicker(false)}
        />
      )}
    </SafeAreaView>
  );
}
