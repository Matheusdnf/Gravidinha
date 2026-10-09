import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { AuthProvider, useAuth } from "../state/auth";
import { useEffect } from "react";
import { View, ActivityIndicator, LogBox, Platform, Alert } from "react-native";
import { registerForPushNotificationsAsync } from "../lib/notifications";

// No react-native-web o Alert.alert não faz nada: erros e confirmações sumiam em silêncio
if (Platform.OS === "web") {
  Alert.alert = (title, message, buttons) => {
    const texto = [title, message].filter(Boolean).join("\n\n");
    if (!buttons || buttons.length < 2) {
      window.alert(texto);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancelar = buttons.find((b) => b.style === "cancel") ?? buttons[0];
    const confirmar = buttons.filter((b) => b !== cancelar).pop();
    (window.confirm(texto) ? confirmar : cancelar)?.onPress?.();
  };
}

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

  // Registra notificações uma única vez, não a cada navegação
  useEffect(() => {
    registerForPushNotificationsAsync().catch(console.error);
  }, []);

  useEffect(() => {
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
      // Animações do iOS quebram no Expo Go Android — no iOS usa a animação nativa padrão
      animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
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
