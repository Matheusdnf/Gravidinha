import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { AuthProvider, useAuth } from "../state/auth";
import { useEffect } from "react";
import { View, ActivityIndicator, LogBox, Platform, Alert } from "react-native";
import { instalarAlertas } from "../lib/alerta";
import { AlertaHost } from "../components/AlertaHost";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import { aoAvisar } from "../lib/sync";
import { carregarTema, useCores } from "../lib/tema";
import { StatusBar } from "expo-status-bar";

carregarTema();

// Todo Alert.alert do app passa a abrir o alerta com o visual do app (components/AlertaHost.tsx)
instalarAlertas();

LogBox.ignoreLogs([
  "Warning: ScrollView doesn't take rejection well",
  "Warning: BottomSheetModal",
  "DateTimePicker: `onChange` is deprecated",
  "Non-serializable values were found in the navigation state",
  "InteractionManager has been deprecated",
]);

function RootLayoutNav() {
  const cores = useCores();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Registra notificações uma única vez, não a cada navegação
  useEffect(() => {
    registerForPushNotificationsAsync().catch(console.error);
  }, []);

  // Alteração feita offline que o servidor recusou ao sincronizar
  useEffect(
    () =>
      aoAvisar((avisos) =>
        Alert.alert("Atenção", "Uma alteração feita offline não pôde ser salva: " + avisos.join("; ")),
      ),
    [],
  );

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo }}>
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
      contentStyle: { backgroundColor: cores.fundo },
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
      <StatusBar style="auto" />
      <RootLayoutNav />
      <AlertaHost />
    </AuthProvider>
  );
}
