import { Text, TouchableOpacity, View } from "react-native";
import { TabSwitcherProps } from "../../types/components";

export function TabSwitcher({ activeTab, setActiveTab }: TabSwitcherProps) {
  const tabs = ["Quiz", "Registro", "Conquistas"];

  return (
    <View className="bg-creme/50 rounded-full p-1.5 flex-row items-center justify-between my-5 w-full">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 rounded-full items-center justify-center ${
              isSelected ? "bg-cartao" : ""
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-sm font-bold ${
                isSelected ? "text-[#D97D54]" : "text-texto-suave"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
