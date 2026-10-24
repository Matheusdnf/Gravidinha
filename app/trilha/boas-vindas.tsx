import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCores } from "../../lib/tema";
import { BOAS_VINDAS, CHAVE_BOAS_VINDAS } from "../../lib/trilhaConteudo";

export default function BoasVindasScreen() {
  const cores = useCores();
  const router = useRouter();
  const [i, setI] = useState(0);
  const passo = BOAS_VINDAS[i];
  const ultimo = i === BOAS_VINDAS.length - 1;

  // Marca como vista ao abrir: voltar pelo gesto/botão do sistema não a faz reaparecer
  useEffect(() => {
    AsyncStorage.setItem(CHAVE_BOAS_VINDAS, "1").catch(console.error);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-fundo">
      <View className="flex-1 w-full max-w-2xl mx-auto px-6">
        {/* Topo: progresso dos passos e pular */}
        <View className="flex-row items-center justify-between pt-3 pb-2">
          <View className="flex-row">
            {BOAS_VINDAS.map((_, k) => (
              <View
                key={k}
                style={{ width: k === i ? 22 : 8, backgroundColor: k <= i ? passo.cor : cores.bordaForte }}
                className="h-2 rounded-full mr-1.5"
              />
            ))}
          </View>
          {!ultimo && (
            <TouchableOpacity onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
              <Text className="text-sm font-bold text-texto-suave">Pular</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View
            style={{ backgroundColor: passo.cor + "22" }}
            className="w-28 h-28 rounded-[36px] items-center justify-center self-center mb-8"
          >
            <MaterialCommunityIcons name={passo.icone as any} size={60} color={passo.cor} />
          </View>
          <Text className="text-2xl font-extrabold text-texto text-center">{passo.titulo}</Text>
          <Text className="text-base text-texto-2 text-center mt-3 leading-relaxed">{passo.texto}</Text>

          <View className="bg-cartao border border-borda rounded-[22px] p-4 mt-7">
            {passo.itens.map((item, k) => (
              <View key={item} className={`flex-row items-start ${k > 0 ? "mt-3" : ""}`}>
                <Ionicons name="checkmark-circle" size={20} color={passo.cor} />
                <Text className="flex-1 text-sm text-texto ml-2.5 font-medium">{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="flex-row pb-6 pt-2">
          {i > 0 && (
            <TouchableOpacity
              onPress={() => setI(i - 1)}
              activeOpacity={0.9}
              accessibilityLabel="Voltar"
              style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: cores.bordaForte }}
              className="bg-cartao rounded-2xl w-14 items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={22} color={cores.textoSuave} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => (ultimo ? router.back() : setI(i + 1))}
            activeOpacity={0.9}
            style={{ backgroundColor: "#D97D54", borderBottomWidth: 4, borderColor: "#B5603B" }}
            className="flex-1 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-extrabold text-base uppercase tracking-wider">
              {ultimo ? "Começar a trilha" : "Próximo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
