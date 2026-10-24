import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { imagensSemanas } from "../../constants/imagesSemanas";
import type { Jornada } from "../../lib/dados";
import { ALBUM_COMPLETO, TOTAL_SEMANAS, TRIMESTRES } from "../../lib/jornada";
import { useCores } from "../../lib/tema";
import sintDb from "../../sint_db.json";
import { DECOR_TRIMESTRE, FundoDecorado } from "./FundoDecorado";

// "Limão Taiti", "Nenhuma (Fase de preparação)" → "Preparação"
const legenda = (s: number) => {
  const c = sintDb.find((d) => d.semana === s)?.comparacao ?? "";
  const entre = c.match(/\((.*)\)/)?.[1];
  return c.startsWith("Nenhuma") && entre ? entre.replace(/^Fase de /, "") : c;
};

export function Album({ jornada, onAbrir }: { jornada: Jornada; onAbrir: (semana: number) => void }) {
  const cores = useCores();
  const n = jornada.coletadas.size;

  return (
    <View>
      <View className="bg-cartao border border-borda rounded-[22px] p-4 mb-5 flex-row items-center">
        <View
          style={{
            backgroundColor: jornada.albumCompleto ? "#F5B301" : cores.creme,
            borderBottomWidth: 5,
            borderColor: jornada.albumCompleto ? "#C98F00" : cores.bordaForte,
          }}
          className="w-14 h-14 rounded-2xl items-center justify-center"
        >
          <MaterialCommunityIcons
            name={ALBUM_COMPLETO.icone as any}
            size={28}
            color={jornada.albumCompleto ? "#FFF" : cores.textoSuave}
          />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-base font-extrabold text-texto">
            {jornada.albumCompleto ? ALBUM_COMPLETO.titulo + "! 🎉" : "Álbum do bebê"}
          </Text>
          <Text className="text-xs text-texto-suave mt-0.5">
            {jornada.albumCompleto
              ? ALBUM_COMPLETO.descricao
              : jornada.novas.length
                ? `${jornada.novas.length} figurinha${jornada.novas.length > 1 ? "s" : ""} esperando por você`
                : "Volte na próxima semana para a nova figurinha"}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="flex-1 h-2 bg-creme rounded-full overflow-hidden">
              <View style={{ width: `${(n / TOTAL_SEMANAS) * 100}%` }} className="h-full bg-[#F5B301] rounded-full" />
            </View>
            <Text className="text-xs font-bold text-texto-2 ml-2">
              {n}/{TOTAL_SEMANAS}
            </Text>
          </View>
        </View>
      </View>

      {/* Uma página por trimestre, com o fundo decorado aparecendo nos espaços ainda vazios */}
      {TRIMESTRES.map((t) => {
        const semanas = Array.from({ length: t.ate - t.de + 1 }, (_, i) => t.de + i);
        const feitas = semanas.filter((s) => jornada.coletadas.has(s)).length;
        return (
          <View
            key={t.numero}
            style={{ borderColor: t.cor + "33", backgroundColor: t.cor + "0D" }}
            className="rounded-[24px] border-2 p-3 mb-5 overflow-hidden"
          >
            <FundoDecorado icones={DECOR_TRIMESTRE[t.numero]} cor={t.cor} opacidade={0.28} />
            <View className="flex-row items-center px-1 mb-2">
              <View style={{ backgroundColor: t.cor }} className="w-7 h-7 rounded-lg items-center justify-center">
                <MaterialCommunityIcons name={t.icone as any} size={16} color="#FFF" />
              </View>
              <Text style={{ color: t.sombra }} className="flex-1 text-sm font-extrabold ml-2">
                {t.titulo}
              </Text>
              <Text style={{ color: t.sombra }} className="text-xs font-bold">
                {feitas}/{semanas.length}
              </Text>
            </View>

            <View className="flex-row flex-wrap">
              {semanas.map((s) => (
                <Figurinha key={s} semana={s} jornada={jornada} cor={t} onAbrir={onAbrir} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Figurinha({
  semana: s,
  jornada,
  cor: t,
  onAbrir,
}: {
  semana: number;
  jornada: Jornada;
  cor: (typeof TRIMESTRES)[number];
  onAbrir: (semana: number) => void;
}) {
  const cores = useCores();
  const coletada = jornada.coletadas.has(s);
  const liberada = jornada.liberada(s);
  return (
    <View style={{ width: "25%", padding: 4 }}>
      <TouchableOpacity
        disabled={!liberada}
        onPress={() => onAbrir(s)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Semana ${s}${coletada ? `, ${legenda(s)}` : liberada ? ", nova figurinha" : ", ainda não chegou"}`}
        style={{
          borderColor: coletada || liberada ? t.cor : cores.bordaForte,
          borderStyle: coletada ? "solid" : "dashed",
          borderWidth: 2,
          borderBottomWidth: coletada ? 4 : 2,
          // vazias ficam transparentes: o fundo decorado da página aparece por trás
          backgroundColor: coletada ? cores.cartao : liberada ? cores.cartao + "CC" : "transparent",
          transform: coletada ? [{ rotate: s % 2 ? "-2deg" : "2deg" }] : undefined, // figurinha "colada"
        }}
        className="rounded-2xl overflow-hidden"
      >
        <View style={{ aspectRatio: 1 }} className="items-center justify-center">
          {coletada ? (
            imagensSemanas[s] ? (
              <Image source={imagensSemanas[s]} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              // semana ainda sem ilustração (constants/imagesSemanas.ts)
              <MaterialCommunityIcons name={t.icone as any} size={30} color={t.cor} />
            )
          ) : liberada ? (
            <Ionicons name="sparkles" size={22} color={t.cor} />
          ) : (
            <>
              <Text style={{ color: t.cor + "99" }} className="text-xl font-extrabold">
                {s}
              </Text>
              <Ionicons name="lock-closed" size={10} color={t.cor + "99"} />
            </>
          )}
        </View>
        <View style={coletada ? { backgroundColor: t.cor } : undefined} className="py-1 px-1">
          <Text
            style={!coletada && liberada ? { color: t.sombra } : undefined}
            className={`text-[9px] font-bold text-center ${coletada ? "text-white" : liberada ? "" : "text-texto-fraco"}`}
            numberOfLines={1}
          >
            {coletada ? legenda(s) : liberada ? "Abrir ✨" : `Semana ${s}`}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
