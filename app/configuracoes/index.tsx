import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../../components/BackButton";
import { definirTema, preferenciaTema, useCores, type PreferenciaTema } from "../../lib/tema";

const TEMAS: { valor: PreferenciaTema; label: string; icone: "smartphone" | "sun" | "moon" }[] = [
  { valor: "sistema", label: "Automático", icone: "smartphone" },
  { valor: "claro", label: "Claro", icone: "sun" },
  { valor: "escuro", label: "Escuro", icone: "moon" },
];

export default function ConfiguracoesScreen() {
  const cores = useCores();
  const [tema, setTema] = useState(preferenciaTema);

  return (
    <SafeAreaView className="flex-1 bg-fundo">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        className="w-full max-w-2xl mx-auto"
      >
        <BackButton fallback="/(tabs)/perfil" />

        <Text className="text-3xl font-extrabold text-texto tracking-tight mb-6">Configurações</Text>

        <Text className="text-xs font-extrabold text-texto-suave tracking-wider uppercase mb-2">
          Aparência
        </Text>
        <View className="flex-row bg-cartao border border-borda rounded-2xl p-1 w-full mb-2">
          {TEMAS.map((t) => {
            const ativo = tema === t.valor;
            return (
              <TouchableOpacity
                key={t.valor}
                onPress={() => {
                  definirTema(t.valor);
                  setTema(t.valor);
                }}
                activeOpacity={0.8}
                className={`flex-1 flex-row py-3 rounded-xl items-center justify-center ${ativo ? "bg-[#C56A43]" : ""}`}
              >
                <Feather name={t.icone} size={14} color={ativo ? "#FFF" : cores.textoSuave} />
                <Text className={`text-xs font-bold ml-1.5 ${ativo ? "text-white" : "text-texto-suave"}`}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text className="text-xs text-texto-suave">
          No automático, o app segue o modo claro ou escuro do celular.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
