import { Pressable, View, Text, TouchableOpacity } from "react-native";
import { ConfirmModalProps } from "../types/components";
import { Ionicons } from "@expo/vector-icons";
import { FullScreenModal } from "./FullScreenModal";
import { useCores } from "../lib/tema";

export function ConfirmModal({
  visible,
  title,
  message,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  onCancel,
  onConfirm,
  isDestructive = false,
}: ConfirmModalProps) {
  const cores = useCores();
  return (
    <FullScreenModal visible={visible} onClose={onCancel} animationType="fade">
      <Pressable
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
        onPress={onCancel}
      >
        <Pressable
          style={{
            backgroundColor: cores.cartao,
            width: "100%",
            maxWidth: 384,
            borderRadius: 32,
            padding: 24,
            boxShadow: "0 0 24px rgba(0,0,0,0.15)",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ alignItems: "center", marginBottom: 20, marginTop: 8 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: isDestructive ? cores.vermelho : cores.pessego,
              alignItems: "center", justifyContent: "center", marginBottom: 16
            }}>
              <Ionicons
                name={isDestructive ? "warning" : "help-circle"}
                size={32}
                color={isDestructive ? "#E25C5C" : "#D97D54"}
              />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: cores.texto, textAlign: "center", marginBottom: 8 }}>
              {title}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "500", color: cores.textoSuave, textAlign: "center", lineHeight: 20 }}>
              {message}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onConfirm}
            style={{
              width: "100%", borderRadius: 16, paddingVertical: 14,
              alignItems: "center", marginBottom: 12,
              backgroundColor: isDestructive ? "#E25C5C" : "#D97D54"
            }}
            activeOpacity={0.9}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{confirmText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            style={{
              width: "100%", borderRadius: 16, paddingVertical: 14,
              alignItems: "center", backgroundColor: cores.suave,
              borderWidth: 1, borderColor: cores.borda
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: cores.textoSuave, fontWeight: "700", fontSize: 14 }}>{cancelText}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </FullScreenModal>
  );
}
