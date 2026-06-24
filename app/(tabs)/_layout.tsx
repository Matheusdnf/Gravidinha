import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
export default function TabsLayout() {
  // Configuração de cores baseada no design da imagem
  const activeColor = "#D97D54"; // Tom terracota/laranja
  const inactiveColor = "#8A7A75"; // Marrom/cinza neutro suave
  const tabBgColor = "#FFFDFB"; // Fundo levemente off-white
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBgColor,
          borderTopWidth: 1,
          borderTopColor: "#F0EBE6",
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 0, // Remove sombra no Android
          boxShadow: "none", // Remove sombra no iOS/Web (substitui shadowOpacity: 0)
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      {/* 1. Aba: Início */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={
                focused ? "bg-[#FDF2EE] p-2 rounded-full -mt-1" : "p-2"
              }
            >
              <MaterialCommunityIcons
                name={focused ? "view-dashboard" : "view-dashboard-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      {/* 2. Aba: Jornada (Selecionada na imagem) */}
      <Tabs.Screen
        name="jornada"
        options={{
          title: "Jornada",
          tabBarIcon: ({ color, focused }) => (
            // A classe bg-[#FDF2EE] adiciona o fundo arredondado suave visto na imagem
            <View
              className={
                focused ? "bg-[#FDF2EE] px-4 py-2 rounded-full -mt-1" : "p-2"
              }
            >
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      {/* 3. Aba: Atividades */}
      <Tabs.Screen
        name="atividades"
        options={{
          title: "Atividades",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={
                focused ? "bg-[#FDF2EE] p-2 rounded-full -mt-1" : "p-2"
              }
            >
              <Ionicons
                name={focused ? "game-controller" : "game-controller-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      {/* 4. Aba: Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={
                focused ? "bg-[#FDF2EE] p-2 rounded-full -mt-1" : "p-2"
              }
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
