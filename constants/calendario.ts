import { LocaleConfig } from "react-native-calendars";

// Importar este arquivo já deixa o react-native-calendars em português
LocaleConfig.locales["pt-br"] = {
  monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
  monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  dayNames: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

export const calendarTheme = {
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
} as const;

// Tema do react-native-ui-datepicker (CalendarModal): ano → mês → dia
const celula = { borderRadius: 12, borderWidth: 0 };
const destaque = { backgroundColor: "#C56A43", borderRadius: 12 };
const textoDestaque = { color: "#ffffff", fontWeight: "800" as const };
const rotulo = { color: "#2C221E", fontWeight: "700" as const, fontSize: 13 };
const seletor = { color: "#2C221E", fontWeight: "800" as const, fontSize: 16, textTransform: "capitalize" as const };

export const datePickerStyles = {
  day: celula,
  day_label: rotulo,
  month: { ...celula, backgroundColor: "#FDF2EE" },
  month_label: { ...rotulo, textTransform: "capitalize" as const },
  year: { ...celula, backgroundColor: "#FDF2EE" },
  year_label: rotulo,
  header: { marginBottom: 8 },
  month_selector_label: seletor,
  year_selector_label: seletor,
  weekday_label: { color: "#8A7A75", fontWeight: "700" as const, fontSize: 11, textTransform: "capitalize" as const },
  selected: destaque,
  selected_label: textoDestaque,
  selected_month: destaque,
  selected_month_label: textoDestaque,
  selected_year: destaque,
  selected_year_label: textoDestaque,
  active_year: { backgroundColor: "#FADCD0" },
  active_year_label: { color: "#C56A43", fontWeight: "800" as const },
  today: { borderWidth: 1.5, borderColor: "#C56A43", borderRadius: 12 },
  today_label: { color: "#C56A43", fontWeight: "800" as const },
  disabled_label: { color: "#E0D7D3" },
  outside_label: { color: "#E0D7D3" },
};
