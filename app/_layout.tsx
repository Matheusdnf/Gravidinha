import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { AuthProvider, useAuth } from "../state/auth";
import { useEffect } from "react";
import { View, ActivityIndicator, LogBox, Platform } from "react-native";
import { registerForPushNotificationsAsync } from "../lib/notifications";

LogBox.ignoreLogs([
  "Warning: ScrollView doesn't take rejection well",
  "Warning: BottomSheetModal",
  "DateTimePicker: `onChange` is deprecated",
  "Non-serializable values were found in the navigation state",
  "InteractionManager has been deprecated",
]);

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync().catch(console.error);
    
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isGestacaoFlow = segments[1] === 'gestacao' || segments[1] === 'linha-tempo';
    
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup && !isGestacaoFlow) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FBF9F6" }}>
        <ActivityIndicator size="large" color="#D97D54" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      // 'ios' quebra no Expo Go Android — usa 'fade' que é seguro em todas as plataformas
      animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'ios',
      animationDuration: 250,
      contentStyle: { backgroundColor: '#FBF9F6' },
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
