import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BottomSheetModal } from "../BottomSheetModal";
import { useCores } from "../../lib/tema";
import { diaISO, type Ofensiva } from "../../lib/trilha";

const LARANJA = "#F97316";
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

// Calendário dos dias em que a usuária praticou a trilha, com sequência atual, recorde e total
export function OfensivaSheet({ visible, onClose, ofensiva }: { visible: boolean; onClose: () => void; ofensiva: Ofensiva }) {
  const cores = useCores();
  const hoje = new Date();
  const [mes, setMes] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });

  // Navega do mês do primeiro dia praticado até o mês atual
  const primeiro = ofensiva.dias[0]?.split("-").map(Number);
  const indice = (a: number, m: number) => a * 12 + m;
  const atualIdx = indice(mes.ano, mes.mes);
  const podeVoltar = primeiro ? atualIdx > indice(primeiro[0], primeiro[1] - 1) : false;
  const podeAvancar = atualIdx < indice(hoje.getFullYear(), hoje.getMonth());
  const mudar = (delta: number) => {
    const d = new Date(mes.ano, mes.mes + delta, 1);
    setMes({ ano: d.getFullYear(), mes: d.getMonth() });
  };

  const feitos = new Set(ofensiva.dias);
  const hojeIso = diaISO(hoje);
  const vazios = new Date(mes.ano, mes.mes, 1).getDay();
  const totalDias = new Date(mes.ano, mes.mes + 1, 0).getDate();
  const celulas = [...Array(vazios).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];

  const titulo =
    ofensiva.atual === 0 ? "Comece sua ofensiva" : `${ofensiva.atual} ${ofensiva.atual === 1 ? "dia seguido" : "dias seguidos"}`;

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Sua ofensiva">
      {/* Destaque da sequência atual */}
      <View className="items-center mb-5">
        <MaterialCommunityIcons name="fire" size={52} color={ofensiva.atual ? LARANJA : cores.textoFraco} />
        <Text className="text-2xl font-extrabold text-texto mt-1">{titulo}</Text>
        <View className="flex-row mt-3">
          <Numero icone="trophy-outline" valor={ofensiva.recorde} rotulo="recorde" />
          <Numero icone="calendar-check" valor={ofensiva.total} rotulo="dias no total" />
        </View>
      </View>

      {/* Calendário do mês */}
      <View className="bg-suave rounded-[22px] p-4">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => mudar(-1)} disabled={!podeVoltar} hitSlop={10} accessibilityLabel="Mês anterior">
            <Ionicons name="chevron-back" size={20} color={podeVoltar ? cores.texto : cores.textoFraco} />
          </TouchableOpacity>
          <Text className="text-base font-extrabold text-texto">
            {MESES[mes.mes]} {mes.ano}
          </Text>
          <TouchableOpacity onPress={() => mudar(1)} disabled={!podeAvancar} hitSlop={10} accessibilityLabel="Próximo mês">
            <Ionicons name="chevron-forward" size={20} color={podeAvancar ? cores.texto : cores.textoFraco} />
          </TouchableOpacity>
        </View>

        <View className="flex-row">
          {SEMANA.map((d, i) => (
            <Text key={i} style={{ width: `${100 / 7}%` }} className="text-center text-[11px] font-bold text-texto-suave mb-1">
              {d}
            </Text>
          ))}
        </View>
        <View className="flex-row flex-wrap">
          {celulas.map((dia, i) => {
            if (!dia) return <View key={`v${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
            const iso = diaISO(new Date(mes.ano, mes.mes, dia));
            const feito = feitos.has(iso);
            const ehHoje = iso === hojeIso;
            const futuro = iso > hojeIso;
            return (
              <View
                key={iso}
                style={{ width: `${100 / 7}%`, height: 40 }}
                className="items-center justify-center"
                accessible
                accessibilityLabel={`${dia} de ${MESES[mes.mes]}${feito ? ", praticado" : ""}${ehHoje ? ", hoje" : ""}`}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: feito ? LARANJA : "transparent",
                    borderWidth: ehHoje ? 2 : 0,
                    borderColor: LARANJA,
                  }}
                  className="items-center justify-center"
                >
                  {feito ? (
                    <MaterialCommunityIcons name="fire" size={16} color="#FFF" />
                  ) : (
                    <Text className={`text-xs font-bold ${futuro ? "text-texto-fraco" : "text-texto-2"}`}>{dia}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Só incentivo, sem punição (proposta da gamificação) */}
      <View className="flex-row items-center bg-pessego rounded-2xl px-4 py-3 mt-4">
        <MaterialCommunityIcons name={ofensiva.praticouHoje ? "check-circle" : "lightning-bolt"} size={20} color={LARANJA} />
        <Text className="flex-1 text-sm text-texto-2 ml-2.5 font-medium">
          {ofensiva.praticouHoje
            ? "Você já praticou hoje! Volte amanhã para continuar a sequência."
            : "Conclua uma casa da trilha hoje para manter sua sequência."}
        </Text>
      </View>
    </BottomSheetModal>
  );
}

function Numero({ icone, valor, rotulo }: { icone: string; valor: number; rotulo: string }) {
  const cores = useCores();
  return (
    <View className="flex-row items-center bg-creme/70 rounded-full px-3 py-1.5 mx-1">
      <MaterialCommunityIcons name={icone as any} size={14} color={cores.texto2} />
      <Text className="text-xs font-bold text-texto-2 ml-1.5">
        {valor} {rotulo}
      </Text>
    </View>
  );
}
