import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

// Ícones grandes e bem suaves espalhados atrás do conteúdo (mesmo recurso das ilustrações da trilha),
// para o caminho e o álbum não parecerem vazios. Posições fixas: o desenho não muda a cada render.
const POSICOES = [
  { top: "1%", left: "2%", size: 58, rot: -12 },
  { top: "4%", left: "58%", size: 34, rot: 18 },
  { top: "9%", right: "3%", size: 74, rot: 10 },
  { top: "17%", left: "30%", size: 40, rot: -20 },
  { top: "22%", left: "4%", size: 50, rot: 8 },
  { top: "29%", right: "22%", size: 36, rot: 12 },
  { top: "35%", right: "1%", size: 64, rot: -8 },
  { top: "43%", left: "40%", size: 44, rot: 24 },
  { top: "48%", left: "0%", size: 70, rot: 14 },
  { top: "56%", right: "30%", size: 34, rot: -16 },
  { top: "61%", right: "4%", size: 54, rot: -14 },
  { top: "69%", left: "26%", size: 42, rot: 10 },
  { top: "74%", left: "3%", size: 62, rot: 6 },
  { top: "81%", right: "18%", size: 38, rot: -22 },
  { top: "87%", right: "2%", size: 56, rot: -6 },
  { top: "93%", left: "45%", size: 40, rot: 16 },
] as const;

// Ícones de cada trimestre (MaterialCommunityIcons)
export const DECOR_TRIMESTRE: Record<number, string[]> = {
  1: ["sprout", "flower-tulip-outline", "heart-outline", "leaf"],
  2: ["baby-face-outline", "teddy-bear", "star-four-points-outline", "butterfly-outline"],
  3: ["baby-carriage", "baby-bottle-outline", "moon-waning-crescent", "balloon"],
};

export function FundoDecorado({ icones, cor, opacidade = 0.2 }: { icones: string[]; cor: string; opacidade?: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, overflow: "hidden" }}>
      {POSICOES.map((p, i) => {
        const { size, rot, ...lugar } = p;
        return (
          <MaterialCommunityIcons
            key={i}
            name={icones[i % icones.length] as any}
            size={size}
            color={cor}
            style={{ position: "absolute", ...lugar, opacity: opacidade, transform: [{ rotate: `${rot}deg` }] }}
          />
        );
      })}
    </View>
  );
}
