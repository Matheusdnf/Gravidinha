import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton: bloco cinza pulsante para indicar carregamento.
 * Usa Animated na thread nativa para máxima fluidez.
 */
export function Skeleton({ width = "100%", height = 16, borderRadius = 12, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#EDE8E3",
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Skeleton do card principal de jornada */
export function JourneyCardSkeleton() {
  return (
    <View className="w-full rounded-[28px] bg-[#E8DDD7] p-5" style={{ height: 160 }}>
      <Skeleton width="50%" height={14} borderRadius={8} style={{ marginBottom: 12 }} />
      <Skeleton width="75%" height={22} borderRadius={8} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={8} borderRadius={8} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={12} borderRadius={8} />
    </View>
  );
}

/** Skeleton do card de destaque da semana */
export function WeekHighlightSkeleton() {
  return (
    <View className="w-full bg-white rounded-[28px] border border-[#F0EBE6] p-5">
      <View className="flex-row items-center mb-3">
        <View className="w-24 h-24 rounded-[20px] bg-[#EDE8E3] mr-4" />
        <View className="flex-1">
          <Skeleton width="60%" height={20} borderRadius={10} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={14} borderRadius={8} style={{ marginBottom: 4 }} />
          <Skeleton width="70%" height={14} borderRadius={8} />
        </View>
      </View>
      <Skeleton width="100%" height={12} borderRadius={8} style={{ marginBottom: 6 }} />
      <Skeleton width="85%" height={12} borderRadius={8} style={{ marginBottom: 16 }} />
      <Skeleton width="40%" height={36} borderRadius={18} />
    </View>
  );
}

/** Skeleton de um card de acesso rápido */
export function QuickAccessSkeleton() {
  return (
    <View className="flex-row gap-3">
      {[0, 1, 2].map((i) => (
        <View key={i} className="flex-1 bg-white rounded-[20px] border border-[#F0EBE6] p-4" style={{ height: 90 }}>
          <Skeleton width={36} height={36} borderRadius={12} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={12} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

/** Skeleton para o Calendário em Consultas */
export function CalendarSkeleton() {
  return (
    <View className="bg-white border border-[#F0EBE6] rounded-3xl p-3 mb-8 w-full" style={{ height: 380 }}>
      <Skeleton width="40%" height={24} borderRadius={12} style={{ alignSelf: 'center', marginVertical: 16 }} />
      <View className="flex-row justify-between px-2 mb-4">
        {[0,1,2,3,4,5,6].map(i => (
          <Skeleton key={i} width={30} height={16} borderRadius={8} />
        ))}
      </View>
      {[0,1,2,3,4].map(row => (
        <View key={row} className="flex-row justify-between px-2 mb-4">
          {[0,1,2,3,4,5,6].map(col => (
             <Skeleton key={col} width={36} height={36} borderRadius={18} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Skeleton para um item de Consulta */
export function AppointmentItemSkeleton() {
  return (
    <View className="flex-row w-full bg-white border border-[#F0EBE6] rounded-3xl p-4 mb-4">
      <Skeleton width={56} height={56} borderRadius={16} style={{ marginRight: 16 }} />
      <View className="flex-1 justify-center">
        <Skeleton width="70%" height={18} borderRadius={9} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} borderRadius={7} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={14} borderRadius={7} />
      </View>
    </View>
  );
}

/** Skeleton para um item de Diário */
export function DiaryItemSkeleton() {
  return (
    <View className="flex-row items-center justify-between bg-white border border-[#F0EBE6] rounded-[24px] p-4 mb-3">
      <View className="flex-row items-center flex-1 pr-4">
        <Skeleton width={56} height={56} borderRadius={16} style={{ marginRight: 16 }} />
        <View className="flex-1">
          <Skeleton width="50%" height={18} borderRadius={9} style={{ marginBottom: 6 }} />
          <Skeleton width="30%" height={14} borderRadius={7} style={{ marginBottom: 6 }} />
          <Skeleton width="80%" height={14} borderRadius={7} />
        </View>
      </View>
    </View>
  );
}
