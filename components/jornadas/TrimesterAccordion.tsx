import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TrimesterBlock } from "../../types/journey";
import { useCores } from "../../lib/tema";

export function TrimesterAccordion({
  title,
  weeksRange,
  description,
  isLocked,
  tasks,
}: TrimesterBlock) {
  const cores = useCores();
  // Se estiver bloqueado, ele começa fechado. Se for o atual, começa aberto.
  const [isOpen, setIsOpen] = useState(!isLocked);

  return (
    <View
      className={`rounded-3xl mb-4 overflow-hidden border w-full ${
        isLocked
          ? "bg-agua border-agua-borda"
          : "bg-pessego border-pessego-borda"
      }`}
    >
      {/* Cabeçalho do Accordion */}
      <TouchableOpacity
        className="p-5 flex-row items-center justify-between w-full"
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View className="flex-row items-center flex-1">
          <View
            className={`p-3 rounded-2xl ${isLocked ? "bg-agua-borda" : "bg-pessego-borda"}`}
          >
            <MaterialCommunityIcons
              name={isLocked ? "lock-outline" : "sprout-outline"}
              size={22}
              color={isLocked ? "#4FA3A5" : "#D97D54"}
            />
          </View>
          <View className="ml-4 flex-1">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-base font-bold text-texto">{title}</Text>
              {!isLocked && (
                <View className="bg-[#D97D54] px-2 py-0.5 rounded-md ml-2">
                  <Text className="text-[10px] text-white font-bold">
                    ATUAL
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-texto-suave mt-0.5">{weeksRange}</Text>
          </View>
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={cores.texto2}
        />
      </TouchableOpacity>

      {/* Conteúdo Expansível */}
      {isOpen && (
        <View className="bg-cartao px-5 pb-5 w-full">
          {/* Descrição curta */}
          <Text className="text-sm text-texto-suave leading-relaxed pt-3 pb-3 border-b border-borda/70">
            {description}
          </Text>

          {/* Lista de Tarefas/Sub-itens baseados no estado real da sua imagem */}
          <View className="mt-2">
            {tasks.map((task) => {
              // Se o card estiver bloqueado, renderiza o número da semana cinza de forma estática
              if (isLocked) {
                return (
                  <View
                    key={task.id}
                    className="flex-row items-center py-3 border-b border-borda"
                  >
                    <Text className="text-sm font-bold text-texto w-6">
                      {task.weekNumber}
                    </Text>
                    <Text className="text-sm text-texto-fraco flex-1 ml-2">
                      {task.title}
                    </Text>
                    <Ionicons
                      name="lock-closed-outline"
                      size={14}
                      color={cores.bordaForte}
                    />
                  </View>
                );
              }

              // Se for o card atual (Desbloqueado), renderiza as bolinhas marrons e o texto ativo
              return (
                <TouchableOpacity
                  key={task.id}
                  className="flex-row items-center py-3 border-b border-borda"
                  activeOpacity={0.7}
                >
                  <View className="w-2 h-2 rounded-full bg-[#D97D54] mr-3" />
                  <Text className="text-sm text-texto font-medium flex-1">
                    {task.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={cores.bordaForte} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
