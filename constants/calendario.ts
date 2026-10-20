import type { Cores } from "./tema";

// Tema do react-native-ui-datepicker (CalendarModal): ano → mês → dia
const celula = { borderRadius: 12, borderWidth: 0 };
const destaque = { backgroundColor: "#C56A43", borderRadius: 12 };
const textoDestaque = { color: "#ffffff", fontWeight: "800" as const };

export const datePickerStyles = (c: Cores) => {
  const rotulo = { color: c.texto, fontWeight: "700" as const, fontSize: 13 };
  const seletor = { color: c.texto, fontWeight: "800" as const, fontSize: 16, textTransform: "capitalize" as const };
  return {
    day: celula,
    day_label: rotulo,
    month: { ...celula, backgroundColor: c.pessego },
    month_label: { ...rotulo, textTransform: "capitalize" as const },
    year: { ...celula, backgroundColor: c.pessego },
    year_label: rotulo,
    header: { marginBottom: 8 },
    month_selector_label: seletor,
    year_selector_label: seletor,
    weekday_label: { color: c.textoSuave, fontWeight: "700" as const, fontSize: 11, textTransform: "capitalize" as const },
    selected: destaque,
    selected_label: textoDestaque,
    selected_month: destaque,
    selected_month_label: textoDestaque,
    selected_year: destaque,
    selected_year_label: textoDestaque,
    active_year: { backgroundColor: c.pessegoBorda },
    active_year_label: { color: "#C56A43", fontWeight: "800" as const },
    today: { borderWidth: 1.5, borderColor: "#C56A43", borderRadius: 12 },
    today_label: { color: "#C56A43", fontWeight: "800" as const },
    disabled_label: { color: c.bordaForte },
    outside_label: { color: c.bordaForte },
  };
};
