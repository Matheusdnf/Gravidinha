import { Pressable } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { CalendarModalProps } from "../types/components";
import { FullScreenModal } from "./FullScreenModal";
import { datePickerStyles } from "../constants/calendario";
import { paraISO } from "../lib/gestacao";

export function CalendarModal({ visible, onClose, selectedDate, onDayPress, maxDate }: CalendarModalProps) {
  const selecionada = paraISO(selectedDate)?.slice(0, 10);

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
            backgroundColor: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(0,0,0,0.12)",
            padding: 16,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Abre no dia; toque no cabeçalho: dia → mês → ano */}
          <DateTimePicker
            mode="single"
            locale="pt-br"
            date={selecionada}
            maxDate={maxDate}
            styles={datePickerStyles}
            components={{
              IconPrev: <Ionicons name="chevron-back" size={20} color="#8A7A75" />,
              IconNext: <Ionicons name="chevron-forward" size={20} color="#8A7A75" />,
            }}
            onChange={({ date }) => date && onDayPress({ dateString: dayjs(date).format("YYYY-MM-DD") })}
          />
        </Pressable>
      </Pressable>
    </FullScreenModal>
  );
}
