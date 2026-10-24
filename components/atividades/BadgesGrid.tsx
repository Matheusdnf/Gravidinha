import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { Jornada } from "../../lib/dados";
import { ALBUM_COMPLETO, MARCOS } from "../../lib/jornada";
import { useCores } from "../../lib/tema";
import { FASES, TEMAS } from "../../lib/trilhaConteudo";

// Uma conquista por tema da trilha, ganha ao concluir a fase par do tema
const CONQUISTAS = FASES.filter((f) => f.conquista).map((f) => ({ fase: f.numero, tema: TEMAS[f.tema - 1], ...f.conquista! }));
const OURO = { cor: "#F5B301", sombra: "#C98F00" };

export function BadgesGrid({ conquistas, jornada }: { conquistas: number[]; jornada?: Jornada | null }) {
  const marcos = jornada?.marcos ?? [];

  return (
    <View className="w-full">
      <Cabecalho titulo="Trilha de saúde mental" ganhas={conquistas.length} total={CONQUISTAS.length} />
      {CONQUISTAS.map((c) => (
        <Linha
          key={c.fase}
          titulo={c.titulo}
          descricao={conquistas.includes(c.tema.numero) ? c.descricao : `Conclua a fase ${c.fase} da trilha`}
          icone={c.icone}
          cor={c.tema}
          ganhou={conquistas.includes(c.tema.numero)}
        />
      ))}

      {/* Marcos da gestação selecionada e o álbum de figurinhas (aba Jornada) */}
      {jornada && (
        <>
          <View className="h-4" />
          <Cabecalho
            titulo="Jornada da gestação"
            ganhas={marcos.length + (jornada.albumCompleto ? 1 : 0)}
            total={MARCOS.length + 1}
          />
          {MARCOS.map((m) => (
            <Linha
              key={m.semana}
              titulo={m.titulo}
              descricao={marcos.includes(m.semana) ? m.descricao : `Abre na semana ${m.semana}`}
              icone={m.icone}
              cor={OURO}
              ganhou={marcos.includes(m.semana)}
            />
          ))}
          <Linha
            titulo={ALBUM_COMPLETO.titulo}
            descricao={jornada.albumCompleto ? ALBUM_COMPLETO.descricao : `${jornada.coletadas.size}/40 figurinhas no álbum`}
            icone={ALBUM_COMPLETO.icone}
            cor={OURO}
            ganhou={jornada.albumCompleto}
          />
        </>
      )}
    </View>
  );
}

function Cabecalho({ titulo, ganhas, total }: { titulo: string; ganhas: number; total: number }) {
  return (
    <View className="flex-row items-center justify-between mb-4 w-full">
      <Text className="text-base font-bold text-texto">{titulo}</Text>
      <Text className="text-xs font-semibold text-[#D97D54]">
        {ganhas}/{total} desbloqueadas
      </Text>
    </View>
  );
}

function Linha({
  titulo,
  descricao,
  icone,
  cor,
  ganhou,
}: {
  titulo: string;
  descricao: string;
  icone: string;
  cor: { cor: string; sombra: string };
  ganhou: boolean;
}) {
  const cores = useCores();
  return (
    <View
      className="bg-cartao border border-borda rounded-[22px] p-4 mb-3 flex-row items-center"
      accessible
      accessibilityLabel={`${titulo}, ${ganhou ? "conquistada" : "bloqueada"}`}
    >
      {/* Medalha: anel claro + disco 3D na cor da conquista */}
      <View style={{ borderColor: ganhou ? cor.cor + "40" : cores.borda }} className="rounded-full p-1 border-4">
        <View
          style={{
            width: 52,
            height: 50,
            borderRadius: 26,
            backgroundColor: ganhou ? cor.cor : cores.creme,
            borderBottomWidth: 5,
            borderColor: ganhou ? cor.sombra : cores.bordaForte,
          }}
          className="items-center justify-center"
        >
          <MaterialCommunityIcons name={(ganhou ? icone : "lock") as any} size={24} color={ganhou ? "#FFF" : cores.textoSuave} />
        </View>
      </View>

      <View className="flex-1 ml-4">
        <Text className={`text-base font-extrabold ${ganhou ? "text-texto" : "text-texto-suave"}`}>{titulo}</Text>
        <Text className="text-xs text-texto-suave mt-0.5">{descricao}</Text>
      </View>

      {ganhou && <Ionicons name="checkmark-circle" size={22} color={cor.cor} />}
    </View>
  );
}
