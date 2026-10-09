import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export default function RespiracaoScreen() {
  const router = useRouter();
  
  // Estados do temporizador e fluxo
  const [duration, setDuration] = useState<number>(60); // Segundos totais
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState(false);
  const [instruction, setInstruction] = useState("Pronto para começar?");
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(false);

  // Animação do círculo de respiração
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startBreathingAnimation = () => {
    // Ciclo 4-7-8
    const INHALE_TIME = 4000;
    const HOLD_TIME = 7000;
    const EXHALE_TIME = 8000;
    const TOTAL_CYCLE = INHALE_TIME + HOLD_TIME + EXHALE_TIME;

    const runCycle = () => {
      if (!isActiveRef.current) return;
      
      setInstruction("Inspirar");
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      scale.value = withTiming(1.8, { duration: INHALE_TIME, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(1, { duration: INHALE_TIME });

      const t1 = setTimeout(() => {
        if (!isActiveRef.current) return;
        setInstruction("Segurar");
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Segura a animação onde está
        
        const t2 = setTimeout(() => {
          if (!isActiveRef.current) return;
          setInstruction("Expirar");
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          
          scale.value = withTiming(1, { duration: EXHALE_TIME, easing: Easing.inOut(Easing.ease) });
          opacity.value = withTiming(0.7, { duration: EXHALE_TIME });
          
        }, HOLD_TIME);
        timeoutsRef.current.push(t2);

      }, INHALE_TIME);
      timeoutsRef.current.push(t1);
    };

    runCycle();
    // Repetir no tempo total do ciclo
    const intervalId = setInterval(() => {
      runCycle();
    }, TOTAL_CYCLE);
    
    return intervalId;
  };

  const toggleTimer = () => {
    if (isActive) {
      // Parar
      setIsActive(false);
      isActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if ((timerRef as any).animInterval) clearInterval((timerRef as any).animInterval);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1);
      opacity.value = withTiming(0.7);
      setInstruction("Pronto para começar?");
    } else {
      // Iniciar
      setIsActive(true);
      isActiveRef.current = true;
      setTimeLeft(duration);
      timeoutsRef.current = [];
      
      const animInterval = startBreathingAnimation();
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            clearInterval(animInterval);
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
            setIsActive(false);
            isActiveRef.current = false;
            setInstruction("Exercício concluído!");
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cancelAnimation(scale);
            cancelAnimation(opacity);
            scale.value = withTiming(1);
            opacity.value = withTiming(0.7);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      (timerRef as any).animInterval = animInterval;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if ((timerRef as any).animInterval) clearInterval((timerRef as any).animInterval);
      timeoutsRef.current.forEach(clearTimeout);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center">
      <View className="w-full max-w-xl flex-1 px-5 relative overflow-hidden">
        
        {/* Círculo Orgânico Decorativo - Fundo da Tela */}
        <View className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-[#F3E2D4] opacity-50 pointer-events-none" />
        <View className="absolute bottom-[-100px] left-[-60px] w-80 h-80 rounded-full bg-[#E8DFDA] opacity-30 pointer-events-none" />

        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mt-4 mb-4 z-20"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#A37262" />
          <Text className="text-[#A37262] font-semibold text-sm ml-1.5">
            Voltar
          </Text>
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center relative mt-4">
          
          {/* Anel Externo (Guia visual do tamanho máximo) */}
          <View className="absolute w-[280px] h-[280px] rounded-full border-[2px] border-[#D97D54]/20" />

          {/* Círculo Animado (Pulmão) */}
          <Animated.View
            style={[
              {
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: "#D97D54",
                position: "absolute",
                boxShadow: "0 10px 20px rgba(217,125,84,0.3)",
              },
              animatedStyle,
            ]}
          />
          
          {/* Conteúdo no Centro do Círculo */}
          <View className="absolute items-center justify-center z-10 w-full h-[150px]">
            {isActive ? (
              <Text className="text-[48px] font-extrabold text-white drop-shadow-lg tracking-tight">
                {formatTime(timeLeft)}
              </Text>
            ) : (
               <MaterialCommunityIcons name="flower-outline" size={56} color="#FFF" style={{ opacity: 0.9 }} />
            )}
          </View>
        </View>

        {/* Textos Informativos Abaixo da Animação */}
        <View className="h-32 items-center justify-start mt-8 z-20">
           <Text className={`text-3xl font-extrabold text-center tracking-tight ${isActive ? 'text-[#D97D54]' : 'text-[#2C221E]'}`}>
             {isActive ? instruction : "Técnica 4-7-8"}
           </Text>
           
           <Text className="text-center text-[#8A7A75] text-base mt-2 font-medium px-4 leading-relaxed">
             {isActive 
                ? (instruction.includes("Inspirar") ? "Puxe o ar pelo nariz contando até 4." 
                   : instruction.includes("Segurar") ? "Retenha o ar nos pulmões contando até 7." 
                   : "Solte o ar pela boca devagar até 8.") 
                : "Encontre seu ritmo e acalme a mente."}
           </Text>
        </View>

        {/* Opções de Tempo */}
        {!isActive && (
          <View className="mb-6 w-full z-20">
            <Text className="text-xs font-bold text-[#A37262] mb-3 text-center uppercase tracking-widest">
              Escolha a Duração
            </Text>
            <View className="flex-row justify-between">
              {[60, 180, 300].map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setDuration(time)}
                  className={`flex-1 mx-1.5 py-3.5 rounded-[20px] items-center border ${
                    duration === time
                      ? "bg-[#FDF2EE] border-[#C56A43]"
                      : "bg-white border-[#F0EBE6]"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-bold text-sm ${
                      duration === time ? "text-[#C56A43]" : "text-[#8A7A75]"
                    }`}
                  >
                    {time / 60} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={toggleTimer}
          className={`rounded-3xl py-4 items-center justify-center shadow-sm w-full mb-10 z-20 ${isActive ? 'bg-[#2C221E]' : 'bg-[#C56A43]'}`}
          activeOpacity={0.9}
        >
          <Text className="text-white font-extrabold text-lg">
            {isActive ? "Parar Exercício" : "Iniciar Respiração"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
