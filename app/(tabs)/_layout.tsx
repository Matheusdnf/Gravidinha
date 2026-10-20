import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCores } from "../../lib/tema";

// Componente separado garante que hooks sejam usados corretamente (fora de callbacks)
function AnimatedTabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      useNativeDriver: Platform.OS !== "web",
      speed: 20,
      bounciness: 8,
    }).start();
  }, [focused]);

  // Pílula baixa (28px) cabe no espaço do ícone e não invade o rótulo
  return (
    <View
      className={
        focused
          ? "bg-pessego w-14 h-7 rounded-full items-center justify-center"
          : "w-14 h-7 items-center justify-center"
      }
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  const cores = useCores();
  const activeColor = "#D97D54";
  const inactiveColor = cores.textoSuave;
  const tabBgColor = cores.cartao;
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBgColor,
          borderTopWidth: 1,
          borderTopColor: cores.borda,
          height: 70 + bottom,
          paddingBottom: 8 + bottom,
          paddingTop: 8,
          elevation: 0,
          boxShadow: "none",
        },
        tabBarIconStyle: { width: 56, height: 28 },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: 2,
        },
      }}
    >
      {/* 1. Aba: Início */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <MaterialCommunityIcons
                name={focused ? "view-dashboard" : "view-dashboard-outline"}
                size={22}
                color={color}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      {/* 2. Aba: Jornada */}
      <Tabs.Screen
        name="jornada"
        options={{
          title: "Jornada",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={22}
                color={color}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      {/* 3. Aba: Atividades */}
      <Tabs.Screen
        name="atividades"
        options={{
          title: "Atividades",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Ionicons
                name={focused ? "game-controller" : "game-controller-outline"}
                size={22}
                color={color}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      {/* 4. Aba: Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
