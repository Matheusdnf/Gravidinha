import { Text, TouchableOpacity, View } from "react-native";

interface TabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TabSwitcher({ activeTab, setActiveTab }: TabSwitcherProps) {
  const tabs = ["Quiz", "Registro", "Conquistas"];

  return (
    <View className="bg-[#F3ECE6]/50 rounded-full p-1.5 flex-row items-center justify-between my-5 w-full">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 rounded-full items-center justify-center ${
              isSelected ? "bg-white" : ""
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-sm font-bold ${
                isSelected ? "text-[#D97D54]" : "text-gray-400"
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
