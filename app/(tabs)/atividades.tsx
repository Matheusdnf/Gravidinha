import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes da Aba
import { BadgesGrid } from "../../components/atividades/BadgesGrid";
import { DailyTracker } from "../../components/atividades/DailyTracker";
import { PastQuizzesList } from "../../components/atividades/PastQuizzesList";
import { StreakCard } from "../../components/atividades/StreakCard";
import { TabSwitcher } from "../../components/atividades/TabSwitcher";

// Mocks
import { mockEngagementData } from "../../state/mockEngagementData";

export default function AtividadesScreen() {
  const [activeTab, setActiveTab] = useState("Quiz");
  const { streakDays, currentWeekQuiz, pastQuizzes } = mockEngagementData;

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Cabeçalho */}
        <Text className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Engajamento
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Quizzes, registros e suas conquistas
        </Text>

        {/* Card do Streak/Ofensiva */}
        <View className="mt-5 w-full">
          <StreakCard days={streakDays} />
        </View>

        {/* Alternador de Abas */}
        <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Renderização Dinâmica Conforme a Aba Selecionada */}
        {activeTab === "Quiz" && (
          <View className="w-full">
            <View className="bg-[#D97D54] rounded-[28px] p-6 mb-6 w-full border border-white/10">
              <View className="flex-row items-center mb-2">
                <Ionicons name="star" size={14} color="#FFF" />
                <Text className="text-white text-xs font-bold uppercase tracking-wider ml-1.5 opacity-90">
                  Quiz Semanal
                </Text>
              </View>

              <Text className="text-white text-2xl font-bold">
                Semana {currentWeekQuiz.weekNumber}
              </Text>
              <Text className="text-[#FFE6DC] text-sm mt-1 mb-6 font-medium">
                {currentWeekQuiz.totalQuestions} perguntas · ~
                {currentWeekQuiz.estimatedMinutes} minutos
              </Text>

              <TouchableOpacity
                className="bg-white rounded-full py-3 px-6 flex-row items-center justify-center self-start"
                activeOpacity={0.9}
              >
                <Text className="text-[#D97D54] font-bold text-sm mr-2">
                  Iniciar Quiz
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#D97D54" />
              </TouchableOpacity>
            </View>

            <Text className="text-base font-bold text-gray-900 mb-3">
              Quizzes Anteriores
            </Text>

            {pastQuizzes.map((quiz) => (
              <PastQuizzesList
                key={quiz.id}
                id={quiz.id}
                weekTitle={quiz.weekTitle}
                date={quiz.date}
                score={quiz.score}
              />
            ))}
          </View>
        )}

        {activeTab === "Registro" && <DailyTracker />}

        {activeTab === "Conquistas" && <BadgesGrid />}
      </ScrollView>
    </SafeAreaView>
  );
}
