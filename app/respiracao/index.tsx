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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useCores } from "../../lib/tema";

// Preferências do aparelho: voz e música ligam/desligam cada uma por conta própria
const CHAVE_VOZ = "gravidinha_respiracao_voz";
const CHAVE_MUSICA = "gravidinha_respiracao_musica";

export default function RespiracaoScreen() {
  const cores = useCores();
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

  const [vozLigada, setVozLigada] = useState(true);
  const [musicaLigada, setMusicaLigada] = useState(true);
  const vozRef = useRef(true);
  const musica = useAudioPlayer(require("../../assets/audio/lofi.wav"));
  // Voz: locuções gravadas em português do Brasil (voz neural), uma por momento do exercício
  const vozes = {
    inspire: useAudioPlayer(require("../../assets/audio/inspire.mp3")),
    segure: useAudioPlayer(require("../../assets/audio/segure.mp3")),
    expire: useAudioPlayer(require("../../assets/audio/expire.mp3")),
    fim: useAudioPlayer(require("../../assets/audio/fim.mp3")),
  };

  const calarVoz = () => Object.values(vozes).forEach((p) => p.pause());
  const falar = (fala: keyof typeof vozes) => {
    if (!vozRef.current) return;
    calarVoz();
    vozes[fala].seekTo(0);
    vozes[fala].play();
  };

  useEffect(() => {
    musica.loop = true;
    musica.volume = 0.35; // abaixo da voz, para a locução ficar clara
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    Promise.all([AsyncStorage.getItem(CHAVE_VOZ), AsyncStorage.getItem(CHAVE_MUSICA)])
      .then(([voz, mus]) => {
        if (voz === "0") { setVozLigada(false); vozRef.current = false; }
        if (mus === "0") setMusicaLigada(false);
      })
      .catch(() => {});
  }, []);

  // Música toca só durante o exercício e só se estiver ligada
  useEffect(() => {
    if (isActive && musicaLigada) musica.play();
    else musica.pause();
  }, [isActive, musicaLigada]);

  const alternarVoz = () => {
    const novo = !vozLigada;
    setVozLigada(novo);
    vozRef.current = novo;
    if (!novo) calarVoz();
    AsyncStorage.setItem(CHAVE_VOZ, novo ? "1" : "0").catch(() => {});
  };

  const alternarMusica = () => {
    const novo = !musicaLigada;
    setMusicaLigada(novo);
    AsyncStorage.setItem(CHAVE_MUSICA, novo ? "1" : "0").catch(() => {});
  };

  const startBreathingAnimation = () => {
    // Ciclo 4-7-8
    const INHALE_TIME = 4000;
    const HOLD_TIME = 7000;
    const EXHALE_TIME = 8000;
    const TOTAL_CYCLE = INHALE_TIME + HOLD_TIME + EXHALE_TIME;

    const runCycle = () => {
      if (!isActiveRef.current) return;
      
      setInstruction("Inspirar");
      falar("inspire");
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      scale.value = withTiming(1.8, { duration: INHALE_TIME, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(1, { duration: INHALE_TIME });

      const t1 = setTimeout(() => {
        if (!isActiveRef.current) return;
        setInstruction("Segurar");
        falar("segure");
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Segura a animação onde está
        
        const t2 = setTimeout(() => {
          if (!isActiveRef.current) return;
          setInstruction("Expirar");
          falar("expire");
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
      calarVoz();
      
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
            falar("fim");
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
      calarVoz();
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
    <SafeAreaView className="flex-1 bg-fundo items-center">
      <View className="w-full max-w-xl flex-1 px-5 relative overflow-hidden">
        
        {/* Círculo Orgânico Decorativo - Fundo da Tela */}
        <View className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-areia opacity-50 pointer-events-none" />
        <View className="absolute bottom-[-100px] left-[-60px] w-80 h-80 rounded-full bg-borda-forte opacity-30 pointer-events-none" />

        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mt-4 mb-4 z-20"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={cores.marrom} />
          <Text className="text-marrom font-semibold text-sm ml-1.5">
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
           <Text className={`text-3xl font-extrabold text-center tracking-tight ${isActive ? 'text-[#D97D54]' : 'text-texto'}`}>
             {isActive ? instruction : "Técnica 4-7-8"}
           </Text>
           
           <Text className="text-center text-texto-suave text-base mt-2 font-medium px-4 leading-relaxed">
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
            <Text className="text-xs font-bold text-marrom mb-3 text-center uppercase tracking-widest">
              Escolha a Duração
            </Text>
            <View className="flex-row justify-between">
              {[60, 180, 300].map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setDuration(time)}
                  className={`flex-1 mx-1.5 py-3.5 rounded-[20px] items-center border ${
                    duration === time
                      ? "bg-pessego border-[#C56A43]"
                      : "bg-cartao border-borda"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-bold text-sm ${
                      duration === time ? "text-[#C56A43]" : "text-texto-suave"
                    }`}
                  >
                    {time / 60} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Voz e música: cada uma liga/desliga sozinha, antes e durante o exercício */}
        <View className="flex-row justify-between mb-4 w-full z-20">
          {[
            { rotulo: "Voz", ligado: vozLigada, alternar: alternarVoz, on: "account-voice", off: "account-voice-off" },
            { rotulo: "Música", ligado: musicaLigada, alternar: alternarMusica, on: "music", off: "music-off" },
          ].map((o) => (
            <TouchableOpacity
              key={o.rotulo}
              onPress={o.alternar}
              accessibilityRole="switch"
              accessibilityState={{ checked: o.ligado }}
              accessibilityLabel={`${o.rotulo} ${o.ligado ? "ligada" : "desligada"}`}
              className={`flex-1 mx-1.5 py-3 rounded-[20px] flex-row items-center justify-center border ${
                o.ligado ? "bg-pessego border-[#C56A43]" : "bg-cartao border-borda"
              }`}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={(o.ligado ? o.on : o.off) as any}
                size={20}
                color={o.ligado ? "#C56A43" : cores.textoSuave}
              />
              <Text className={`font-bold text-sm ml-2 ${o.ligado ? "text-[#C56A43]" : "text-texto-suave"}`}>
                {o.rotulo}: {o.ligado ? "ligada" : "desligada"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={toggleTimer}
          className={`rounded-3xl py-4 items-center justify-center shadow-sm w-full mb-10 z-20 ${isActive ? 'bg-[#7A5C50]' : 'bg-[#C56A43]'}`}
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
