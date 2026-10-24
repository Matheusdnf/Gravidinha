import { Pressable, Text, View } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { CalendarModalProps } from "../types/components";
import { FullScreenModal } from "./FullScreenModal";
import { datePickerStyles } from "../constants/calendario";
import { paraISO } from "../lib/gestacao";
import { useCores } from "../lib/tema";

type CalendarioProps = {
  selectedDate?: string | null;
  onDayPress: (dia: { dateString: string }) => void;
  maxDate?: string;
  // Dias ("aaaa-mm-dd") que ganham um ponto embaixo do número
  marcados?: Set<string>;
};

// Abre no dia; toque no cabeçalho: dia → mês → ano
export function Calendario({ selectedDate, onDayPress, maxDate, marcados }: CalendarioProps) {
  const cores = useCores();
  const estilos = datePickerStyles(cores);

  return (
    <DateTimePicker
      mode="single"
      locale="pt-br"
      date={paraISO(selectedDate)?.slice(0, 10)}
      maxDate={maxDate}
      styles={estilos}
      components={{
        IconPrev: <Ionicons name="chevron-back" size={20} color={cores.textoSuave} />,
        IconNext: <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />,
        ...(marcados && {
          Day: (dia) => (
            <>
              <Text
                style={[
                  estilos.day_label,
                  dia.isToday && estilos.today_label,
                  !dia.isCurrentMonth && estilos.outside_label,
                  dia.isDisabled && estilos.disabled_label,
                  dia.isSelected && estilos.selected_label,
                ]}
              >
                {dia.text}
              </Text>
              {/* dia.date chega como objeto dayjs (o tipo da lib diz string, mas não é): formata em vez de slice */}
              {marcados.has(dayjs(dia.date).format("YYYY-MM-DD")) && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    marginTop: 2,
                    backgroundColor: dia.isSelected ? "#FFFFFF" : "#C56A43",
                  }}
                />
              )}
            </>
          ),
        }),
      }}
      onChange={({ date }) => date && onDayPress({ dateString: dayjs(date).format("YYYY-MM-DD") })}
    />
  );
}

export function CalendarModal({ visible, onClose, selectedDate, onDayPress, maxDate }: CalendarModalProps) {
  const cores = useCores();

  return (
    <FullScreenModal visible={visible} onClose={onClose} animationType="fade">
      <Pressable
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }}
        onPress={onClose}
      >
        <Pressable
          style={{
            width: "100%",
            maxWidth: 448,
            backgroundColor: cores.cartao,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(0,0,0,0.12)",
            padding: 16,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Calendario selectedDate={selectedDate} onDayPress={onDayPress} maxDate={maxDate} />
        </Pressable>
      </Pressable>
    </FullScreenModal>
  );
}
