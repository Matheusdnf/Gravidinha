import { Fragment } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const OPCOES = [
  { valor: "masculino", label: "Menino" },
  { valor: "feminino", label: "Menina" },
  { valor: "nao_informado", label: "Não sei" },
];

// Seletor segmentado Menino / Menina / Não sei. Sem valor conta como "nao_informado".
export function SexoSelector({
  value,
  onChange,
  bg,
  borda,
}: {
  value?: string;
  onChange: (sexo: string) => void;
  bg: string;
  borda: string;
}) {
  const atual = value || "nao_informado";
  return (
    <View
      style={{ backgroundColor: bg, borderColor: borda }}
      className="flex-row items-center border rounded-2xl p-1 w-full overflow-hidden"
    >
      {OPCOES.map((o, i) => {
        const ativo = atual === o.valor;
        return (
          <Fragment key={o.valor}>
            {/* Divisória vertical, só visível quando nada além de "Não sei" está marcado */}
            {i > 0 && (
              <View
                style={{ backgroundColor: borda }}
                className={`w-[1px] h-6 mx-1 ${atual === "nao_informado" ? "opacity-100" : "opacity-0"}`}
              />
            )}
            <TouchableOpacity
              onPress={() => onChange(o.valor)}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${ativo ? "bg-[#C56A43]" : "bg-transparent"}`}
            >
              <Text
                className={`${o.valor === "nao_informado" ? "text-[11px]" : "text-xs"} font-bold ${ativo ? "text-white" : "text-[#8A7A75]"}`}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          </Fragment>
        );
      })}
    </View>
  );
}
