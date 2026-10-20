import { Pressable, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProps } from "../types/components";
import { FullScreenModal } from "./FullScreenModal";
import { useCores } from "../lib/tema";

export function BottomSheetModal({ visible, onClose, title, children }: BottomSheetModalProps) {
  const cores = useCores();
  return (
    <FullScreenModal visible={visible} onClose={onClose} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}
          onPress={onClose}
        >
          <Pressable
            style={{
              backgroundColor: cores.cartao,
              boxShadow: "0 0 20px rgba(0,0,0,0.1)",
              maxHeight: "85%",
              width: "100%",
              maxWidth: 576,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 48,
              borderTopWidth: 1,
              borderColor: cores.borda,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: cores.texto }}>
                {title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: cores.creme + "99", alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="close" size={18} color={cores.texto} />
              </TouchableOpacity>
            </View>
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </FullScreenModal>
  );
}
