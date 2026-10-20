import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { mockBadges } from "../../state/mockEngagementData";
import { useCores } from "../../lib/tema";

export function BadgesGrid() {
  const cores = useCores();
  // Cores dinâmicas para os planos de fundo baseadas na conquista
  const getTypeStyles = (type: string, isUnlocked: boolean) => {
    if (!isUnlocked) return { bg: "bg-creme/80", color: cores.textoSuave };
    switch (type) {
      case "sprout":
        return { bg: "bg-pessego", color: "#D97D54" };
      case "target":
        return { bg: "bg-vermelho", color: "#E25C5C" };
      case "book":
        return { bg: "bg-azul", color: "#6366F1" };
      case "flower":
        return { bg: "bg-rosa", color: "#EC4899" };
      default:
        return { bg: "bg-creme", color: cores.texto2 };
    }
  };

  return (
    <View className="w-full">
      {/* Cabeçalho da Seção */}
      <View className="flex-row items-center justify-between mb-5 w-full">
        <Text className="text-base font-bold text-texto">
          Suas Conquistas
        </Text>
        <Text className="text-xs font-semibold text-[#D97D54]">
          4/8 desbloqueadas
        </Text>
      </View>

      {/* Grid Container (Ajustado com items-start para impedir deformação) */}
      <View className="flex-row flex-wrap justify-between items-start w-full">
        {mockBadges.map((badge) => {
          const styles = getTypeStyles(badge.type, badge.isUnlocked);
          return (
            <View
              key={badge.id}
              // style={{ height: 210 }} garante tamanho uniforme absoluto na Web, iOS e Android
              style={{ height: 210 }}
              className={`w-[48.5%] bg-cartao border border-borda rounded-[24px] p-4 mb-4 justify-between items-center ${
                badge.isUnlocked ? "" : "opacity-70"
              }`}
            >
              {/* 1. TOPO: Área do Ícone */}
              <View className="items-center justify-center pt-1 h-14">
                <View className={`${styles.bg} p-3 rounded-2xl`}>
                  {badge.type === "lock" ? (
                    <Ionicons
                      name="lock-closed"
                      size={18}
                      color={styles.color}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={badge.iconName as any}
                      size={18}
                      color={styles.color}
                    />
                  )}
                </View>
              </View>

              {/* 2. MEIO: Textos centralizados com espaçamento fixo */}
              <View className="items-center justify-center flex-1 w-full my-2">
                <Text
                  className="text-sm font-bold text-texto text-center px-1"
                  numberOfLines={1}
                >
                  {badge.title}
                </Text>
                <Text
                  className="text-[11px] text-texto-suave text-center mt-1 font-medium leading-normal px-2"
                  numberOfLines={2}
                >
                  {badge.description}
                </Text>
              </View>

              {/* 3. RODAPÉ: Status da Conquista com linha divisória limpa */}
              <View className="flex-row items-center justify-center w-full border-t border-borda pt-2.5 pb-1">
                <Ionicons
                  name={
                    badge.isUnlocked ? "trophy-outline" : "lock-closed-outline"
                  }
                  size={12}
                  color={badge.isUnlocked ? "#D97D54" : "#8A7A75"}
                />
                <Text
                  className={`text-[10px] font-bold ml-1 ${badge.isUnlocked ? "text-[#D97D54]" : "text-texto-suave"}`}
                >
                  {badge.isUnlocked ? "Conquistado" : "Bloqueado"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
