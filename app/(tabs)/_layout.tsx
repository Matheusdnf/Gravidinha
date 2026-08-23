import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Componente separado garante que hooks sejam usados corretamente (fora de callbacks)
function AnimatedTabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}

export default function TabsLayout() {
  const activeColor = "#D97D54";
  const inactiveColor = "#8A7A75";
  const tabBgColor = "#FFFDFB";
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
          borderTopColor: "#F0EBE6",
          height: 70 + bottom,
          paddingBottom: 8 + bottom,
          paddingTop: 8,
          elevation: 0,
          boxShadow: "none",
        },
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
              <View
                className={
                  focused
                    ? "bg-[#FDF2EE] border border-[#FADCD0] w-11 h-11 rounded-2xl items-center justify-center"
                    : "w-11 h-11 items-center justify-center"
                }
              >
                <MaterialCommunityIcons
                  name={focused ? "view-dashboard" : "view-dashboard-outline"}
                  size={22}
                  color={color}
                />
              </View>
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
              <View
                className={
                  focused
                    ? "bg-[#FDF2EE] border border-[#FADCD0] w-11 h-11 rounded-2xl items-center justify-center"
                    : "w-11 h-11 items-center justify-center"
                }
              >
                <Ionicons
                  name={focused ? "map" : "map-outline"}
                  size={22}
                  color={color}
                />
              </View>
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
              <View
                className={
                  focused
                    ? "bg-[#FDF2EE] border border-[#FADCD0] w-11 h-11 rounded-2xl items-center justify-center"
                    : "w-11 h-11 items-center justify-center"
                }
              >
                <Ionicons
                  name={focused ? "game-controller" : "game-controller-outline"}
                  size={22}
                  color={color}
                />
              </View>
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
              <View
                className={
                  focused
                    ? "bg-[#FDF2EE] border border-[#FADCD0] w-11 h-11 rounded-2xl items-center justify-center"
                    : "w-11 h-11 items-center justify-center"
                }
              >
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={22}
                  color={color}
                />
              </View>
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
