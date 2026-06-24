import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TrimesterBlock } from "../../types/journey";

export function TrimesterAccordion({
  title,
  weeksRange,
  description,
  isLocked,
  tasks,
}: TrimesterBlock) {
  // Se estiver bloqueado, ele começa fechado. Se for o atual, começa aberto.
  const [isOpen, setIsOpen] = useState(!isLocked);

  return (
    <View
      className={`rounded-3xl mb-4 overflow-hidden border w-full ${
        isLocked
          ? "bg-[#EEF6F6] border-[#E2EDED]"
          : "bg-[#FDF2EE] border-[#FADCD0]"
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
            className={`p-3 rounded-2xl ${isLocked ? "bg-[#D1E5E5]" : "bg-[#F9D2C4]"}`}
          >
            <MaterialCommunityIcons
              name={isLocked ? "lock-outline" : "sprout-outline"}
              size={22}
              color={isLocked ? "#4FA3A5" : "#D97D54"}
            />
          </View>
          <View className="ml-4 flex-1">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-base font-bold text-gray-800">{title}</Text>
              {!isLocked && (
                <View className="bg-[#D97D54] px-2 py-0.5 rounded-md ml-2">
                  <Text className="text-[10px] text-white font-bold">
                    ATUAL
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-gray-500 mt-0.5">{weeksRange}</Text>
          </View>
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#666"
        />
      </TouchableOpacity>

      {/* Conteúdo Expansível */}
      {isOpen && (
        <View className="bg-white px-5 pb-5 w-full">
          {/* Descrição curta */}
          <Text className="text-sm text-gray-500 leading-relaxed pt-3 pb-3 border-b border-gray-100/70">
            {description}
          </Text>

          {/* Lista de Tarefas/Sub-itens baseados no estado real da sua imagem */}
          <View className="mt-2">
            {tasks.map((task, index) => {
              // Se o card estiver bloqueado, renderiza o número da semana cinza de forma estática
              if (isLocked) {
                return (
                  <View
                    key={task.id}
                    className="flex-row items-center py-3 border-b border-gray-50"
                  >
                    <Text className="text-sm font-bold text-gray-800 w-6">
                      {task.weekNumber}
                    </Text>
                    <Text className="text-sm text-gray-300 flex-1 ml-2">
                      {task.title}
                    </Text>
                    <Ionicons
                      name="lock-closed-outline"
                      size={14}
                      color="#DDD"
                    />
                  </View>
                );
              }

              // Se for o card atual (Desbloqueado), renderiza as bolinhas marrons e o texto ativo
              return (
                <TouchableOpacity
                  key={task.id}
                  className="flex-row items-center py-3 border-b border-gray-50"
                  activeOpacity={0.7}
                >
                  <View className="w-2 h-2 rounded-full bg-[#D97D54] mr-3" />
                  <Text className="text-sm text-gray-700 font-medium flex-1">
                    {task.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#CCC" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
