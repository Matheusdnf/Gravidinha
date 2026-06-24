import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  mockChecklist,
  mockMoods,
  mockWeeklyDays,
} from "../../state/mockEngagementData";

export function DailyTracker() {
  const [selectedMood, setSelectedMood] = useState("m1");
  const [checklist, setChecklist] = useState(mockChecklist);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item,
      ),
    );
  };

  return (
    <View className="w-full">
      {/* 1. Seção: Semana Atual */}
      <Text className="text-base font-bold text-gray-900 mb-3">
        Semana Atual
      </Text>
      <View className="flex-row justify-between items-center bg-white border border-[#F0EBE6] rounded-3xl p-4 mb-5 w-full">
        {mockWeeklyDays.map((day, i) => (
          <View key={i} className="items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                day.isCompleted
                  ? "bg-[#EEF6F6] border border-[#E2EDED]"
                  : "bg-[#F3ECE6]/40"
              }`}
            >
              {day.isCompleted ? (
                <Ionicons name="checkmark" size={16} color="#4FA3A5" />
              ) : (
                <View className="w-2 h-2 rounded-sm bg-[#8A7A75]/30" />
              )}
            </View>
            <Text className="text-[10px] text-gray-400 font-medium mt-1.5">
              {day.label}
            </Text>
          </View>
        ))}
      </View>

      {/* 2. Seção: Humor */}
      <Text className="text-base font-bold text-gray-900 mb-3">
        Como você está hoje?
      </Text>
      <View className="flex-row justify-between items-center mb-5 w-full">
        {mockMoods.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <TouchableOpacity
              key={mood.id}
              onPress={() => setSelectedMood(mood.id)}
              className={`p-3 rounded-2xl items-center justify-center border flex-1 mx-0.5 ${
                isSelected
                  ? "bg-[#FDF2EE] border-[#FADCD0]"
                  : "bg-white border-[#F5F2EE]"
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-xl mb-1">{mood.emoji}</Text>
              <Text
                className={`text-[10px] font-bold ${isSelected ? "text-[#D97D54]" : "text-gray-400"}`}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Seção: Checklist */}
      <Text className="text-base font-bold text-gray-900 mb-3">
        Checklist de Hoje
      </Text>
      {checklist.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => toggleCheck(item.id)}
          className="bg-white border border-[#F5F2EE] rounded-2xl p-4 flex-row items-center mb-3 w-full"
          activeOpacity={0.8}
        >
          <View
            className={`w-6 h-6 rounded-full items-center justify-center border ${
              item.isDone ? "bg-[#4FA3A5] border-[#4FA3A5]" : "border-[#CCC]"
            }`}
          >
            {item.isDone && (
              <Ionicons name="checkmark" size={14} color="#FFF" />
            )}
          </View>
          <Text
            className={`ml-3 text-sm flex-1 ${
              item.isDone
                ? "text-gray-400 line-through"
                : "text-gray-700 font-medium"
            }`}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
