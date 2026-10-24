import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { TabSwitcherProps } from "../../types/components";
import { useCores } from "../../lib/tema";

const TABS = [
  { nome: "Trilha", icone: "map-marker-path" },
  { nome: "Conquistas", icone: "trophy-outline" },
];

export function TabSwitcher({ activeTab, setActiveTab, tabs = TABS }: TabSwitcherProps) {
  const cores = useCores();
  return (
    <View className="bg-creme/60 rounded-2xl p-1.5 flex-row items-center justify-between mt-3 mb-6 w-full">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.nome;
        return (
          <TouchableOpacity
            key={tab.nome}
            onPress={() => setActiveTab(tab.nome)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${isSelected ? "bg-cartao" : ""}`}
            style={isSelected ? { boxShadow: "0 1px 4px rgba(0,0,0,0.08)" } : undefined}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={tab.icone as any} size={16} color={isSelected ? "#D97D54" : cores.textoSuave} />
            <Text className={`text-sm font-bold ml-1.5 ${isSelected ? "text-[#D97D54]" : "text-texto-suave"}`}>{tab.nome}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
