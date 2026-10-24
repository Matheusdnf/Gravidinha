import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { BottomSheetModal } from "./BottomSheetModal";
import { AJUDA } from "../lib/trilhaConteudo";

// "Precisa de ajuda?": sinais de alerta e onde buscar apoio (cartilha). Fica acessível na trilha e no
// perfil, independente da fase alcançada (proposta da gamificação, seção 2.3).
export function AjudaSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Precisa de ajuda?">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-bold text-texto mb-2">Procure um profissional se notar:</Text>
        {AJUDA.sinais.map((s) => (
          <View key={s} className="flex-row mb-1.5">
            <Text className="text-texto-suave mr-2">•</Text>
            <Text className="flex-1 text-sm text-texto-2">{s}</Text>
          </View>
        ))}
        <Text className="text-sm font-bold text-texto mt-5 mb-3">Onde buscar ajuda</Text>
        {AJUDA.onde.map((o) => (
          <View key={o.titulo} className="flex-row items-start bg-suave rounded-2xl p-3.5 mb-2.5">
            <MaterialCommunityIcons name={o.icone as any} size={20} color="#4FA3A5" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-texto">{o.titulo}</Text>
              <Text className="text-xs text-texto-suave mt-0.5">{o.texto}</Text>
            </View>
          </View>
        ))}
        <Text className="text-[11px] text-texto-suave mt-3">{AJUDA.aviso}</Text>
      </ScrollView>
    </BottomSheetModal>
  );
}
