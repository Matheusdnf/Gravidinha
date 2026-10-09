import React from "react";
import { Modal, View, Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

interface FullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 'slide' sobe de baixo, 'fade' aparece direto, 'none' sem animação */
  animationType?: "slide" | "fade" | "none";
}

/**
 * FullScreenModal: Modal nativo cobrindo 100% da tela no Android,
 * incluindo barra de status e barra de navegação do sistema.
 * No iOS aplica BlurView nativo. No Android usa overlay escurecido simulado.
 * O toque fora do conteúdo fica a cargo de quem usa (Pressable de fundo).
 */
export function FullScreenModal({
  visible,
  onClose,
  children,
  animationType = "fade",
}: FullScreenModalProps) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType={animationType}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          {children}
        </BlurView>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidOverlay]}>
          {children}
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  androidOverlay: {
    backgroundColor: "rgba(28, 18, 12, 0.75)",
  },
});
