import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../state/auth";
import { BottomSheetModal } from "../../components/BottomSheetModal";

import { useRouter } from "expo-router";

// Componentes Modulares ajustados para o diretório padrão
import { ContentCard } from "../../components/inicio/ContentCard";
import { JourneyCard } from "../../components/inicio/JourneyCard";
import { QuickAccessButton } from "../../components/inicio/QuickAccessButton";

import { mockBlocksData } from "../../state/mockDashboardData";
import { imagensSemanas } from "../../constants/imagesSemanas";
import { JourneyCardSkeleton, WeekHighlightSkeleton, QuickAccessSkeleton } from "../../components/Skeleton";
import { calcularSemanaAtual, getTrimestre } from "../../lib/gestacao";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, selectedGestacao, setSelectedGestacao } = useAuth();
  const [pregnancyData, setPregnancyData] = useState<any>({
    currentWeek: 0,
    totalWeeks: 40,
    trimester: "1º Trimestre",
    progressPercentage: 0,
    offlineSaved: "",
  });

  const [desenvolvimento, setDesenvolvimento] = useState<any>(null);

  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  useEffect(() => {
    if (selectedGestacao) {
      setIsLoadingDashboard(true);
      // Usa o utilitário compartilhado: mesma lógica de Minhas Gestações
      // Se finalizada, usa data_finalizacao para congelar a contagem
      const currentWeek = calcularSemanaAtual(
        selectedGestacao.semanas || 0,
        selectedGestacao.data_inicio,
        selectedGestacao.data_finalizacao
      );
      const trimesterString = getTrimestre(currentWeek);
      const progress = Math.min(100, (currentWeek / 40) * 100);

      setPregnancyData({
        currentWeek,
        totalWeeks: 40,
        trimester: trimesterString,
        progressPercentage: progress,
        offlineSaved: selectedGestacao.status === 'finalizada' ? 'Gestação Finalizada' : 'Dados sincronizados',
      });

      // Busca desenvolvimento e consultas em paralelo
      if (user?.id) {
        Promise.all([
          fetch(`/api/desenvolvimento?id_user=${user.id}`).then(r => r.json()).catch(() => null),
          fetchConsultasAsNotifications(),
        ]).then(([devJson]) => {
          if (devJson && !devJson.error && devJson.dados) {
            setDesenvolvimento(devJson);
            // Não sobrescreve a semana — apenas atualiza os dados de desenvolvimento
            // para exibir comparação e descrição corretas para a semana calculada localmente
          }
        }).catch(console.error)
          .finally(() => setIsLoadingDashboard(false));
      } else {
        setIsLoadingDashboard(false);
      }

    } else if (user?.id) {
      setIsLoadingDashboard(true);
      fetch(`/api/gestacao?id_user=${user.id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.gestacoes && json.gestacoes.length > 0) {
            const ativa =
              json.gestacoes.find(
                (g: any) => g.status === "ativa" || !g.status,
              ) || json.gestacoes[0];
            setSelectedGestacao(ativa);
          } else {
            setIsLoadingDashboard(false);
          }
        })
        .catch((e) => {
          console.error(e);
          setIsLoadingDashboard(false);
        });
    }
  }, [user?.id, selectedGestacao]);


  const fetchConsultasAsNotifications = async () => {
    if (!user?.id || !selectedGestacao?.id_gestacao) return;
    setIsLoadingNotifications(true);
    try {
      const res = await fetch(`/api/consultas?id_user=${user.id}&id_gestacao=${selectedGestacao.id_gestacao}`);
      if (res.ok) {
        const json = await res.json();
        const consultas = json.consultas || [];
        
        const now = new Date();
        const notifs = consultas.map((c: any) => {
          const cDate = new Date(c.data);
          // Adiciona a hora correta
          if (c.horario) {
            const [h, m] = c.horario.split(':');
            cDate.setHours(Number(h), Number(m));
          }
          
          const isPast = cDate < now;
          const isToday = cDate.toDateString() === now.toDateString();
          
          let title = "Nova Consulta";
          let message = `Consulta ${c.descricao} marcada para ${c.horario}`;
          let isNew = !isPast;
          
          if (isPast && !isToday) {
            title = "Consulta Concluída";
            message = `Como foi sua consulta de ${c.descricao}?`;
            isNew = false;
          } else if (isToday) {
            title = "Consulta Hoje!";
            message = `Lembrete: Você tem ${c.descricao} hoje às ${c.horario}.`;
            isNew = true;
          } else if (isNew) {
            const daysDiff = Math.ceil((cDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
            if (daysDiff === 1) {
               title = "Consulta Amanhã!";
               message = `Prepare-se para ${c.descricao} às ${c.horario}.`;
            }
          }

          return {
            id: c.id_consulta,
            title,
            message,
            date: cDate,
            isNew,
            icon: isPast ? "calendar-check" : "calendar-clock"
          };
        });
        
        // Ordena para notificações novas ficarem no topo, e depois por data
        notifs.sort((a: any, b: any) => {
           if (a.isNew === b.isNew) {
              return b.date.getTime() - a.date.getTime();
           }
           return a.isNew ? -1 : 1;
        });
        
        setNotificationsList(notifs);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const unreadCount = notificationsList.filter(n => n.isNew).length;

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F6] items-center">
      <View className="w-full max-w-xl flex-1 px-5">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        >
          {/* Cabeçalho de Boas-vindas e Notificações */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-sm font-medium text-[#8A7A75]">
                Olá,
              </Text>
              <Text className="text-2xl font-extrabold text-[#2C221E]">
                Bem-vindo(a), {user?.nome?.split(' ')[0] || "Usuário"}!
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setIsNotificationModalVisible(true)}
              className="w-12 h-12 bg-white rounded-full items-center justify-center border border-[#F0EBE6] shadow-sm relative"
            >
              {unreadCount > 0 && (
                <View className="absolute top-2.5 right-2.5 w-3 h-3 bg-[#C56A43] rounded-full z-10 border-2 border-white" />
              )}
              <Ionicons name="notifications-outline" size={22} color="#2C221E" />
            </TouchableOpacity>
          </View>

          {/* Card Principal Terracota (Configurado sem boxShadow em JS) */}
          {isLoadingDashboard ? (
            <JourneyCardSkeleton />
          ) : (
            <JourneyCard
              currentWeek={pregnancyData.currentWeek}
              totalWeeks={pregnancyData.totalWeeks}
              trimester={pregnancyData.trimester}
              progressPercentage={pregnancyData.progressPercentage}
              offlineSaved={pregnancyData.offlineSaved}
            />
          )}

          {/* Destaque da Sua Semana */}
          <View className="mt-8 mb-6 w-full">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-[#2C221E] tracking-tight">
                Destaque da Semana
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/artigos')}>
                <Text className="text-sm font-bold text-[#D97D54]">Explorar Temas</Text>
              </TouchableOpacity>
            </View>

            {isLoadingDashboard ? (
              <WeekHighlightSkeleton />
            ) : (
              <TouchableOpacity 
                className="w-full bg-white rounded-[28px] border border-[#F0EBE6] shadow-sm p-5"
                activeOpacity={0.9}
                onPress={() => router.push('/desenvolvimento')}
              >
                <View className="flex-row items-center mb-3">
                  {/* Quadrado com a imagem */}
                  <View className="w-24 h-24 rounded-[20px] bg-[#FADCD0] overflow-hidden mr-4 relative items-center justify-center">
                    {pregnancyData.currentWeek > 0 && imagensSemanas[pregnancyData.currentWeek] && (
                      <Image 
                        source={imagensSemanas[pregnancyData.currentWeek]} 
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  {/* Textos ao lado */}
                  <View className="flex-1 justify-center">
                    <View className="bg-[#FDF2EE] self-start px-3 py-1 rounded-full mb-2 flex-row items-center">
                      <Ionicons name="calendar" size={12} color="#C56A43" />
                      <Text className="text-[#C56A43] text-[10px] font-bold ml-1.5 uppercase">Semana {pregnancyData.currentWeek}</Text>
                    </View>
                    <Text className="text-lg font-extrabold text-[#2C221E] leading-tight">
                      {desenvolvimento?.dados?.comparacao 
                        ? `Tamanho de ${desenvolvimento.dados.comparacao}!` 
                        : "Descobrindo destaques..."}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm text-[#8A7A75] leading-relaxed mb-4" numberOfLines={2}>
                  {desenvolvimento?.dados?.descricao_corpo || "Descubra como seu corpo e seu bebê estão mudando nesta etapa incrível da sua gestação."}
                </Text>
                
                <View className="flex-row items-center justify-between pt-4 border-t border-[#F0EBE6]">
                  <Text className="text-xs font-bold text-[#A37262] uppercase tracking-wider">
                    Ver Desenvolvimento Completo
                  </Text>
                  <View className="w-8 h-8 rounded-full bg-[#FDF2EE] items-center justify-center">
                    <Ionicons name="arrow-forward" size={16} color="#D97D54" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Seção de Acesso Rápido */}
          <Text className="text-lg font-bold text-[#222] mb-3 w-full">
            Acesso Rápido
          </Text>

          {isLoadingDashboard ? (
            <QuickAccessSkeleton />
          ) : (
            <View className="flex-row flex-wrap justify-between items-start w-full">
              <QuickAccessButton
                title="Meu Diário"
                subtitle="Registre seu dia"
                bgColor="bg-[#EEF7F7]"
                icon={
                  <MaterialCommunityIcons
                    name="notebook-outline"
                    size={24}
                    color="#4FA3A5"
                  />
                }
              />
              <QuickAccessButton
                title="Consultas"
                subtitle="Agende e acompanhe"
                bgColor="bg-[#F3E5F5]"
                icon={
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={24}
                    color="#9C27B0"
                  />
                }
              />
              <QuickAccessButton
                title="Respiração"
                subtitle="Exercício guiado"
                bgColor="bg-[#F4FCE3]"
                icon={
                  <MaterialCommunityIcons
                    name="flower-outline"
                    size={24}
                    color="#84CC16"
                  />
                }
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Central de Notificações */}
      <BottomSheetModal
        visible={isNotificationModalVisible}
        onClose={() => setIsNotificationModalVisible(false)}
        title="Notificações"
      >
        <View className="flex-1 pb-6" style={{ minHeight: 300, maxHeight: 500 }}>
          {isLoadingNotifications ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="small" color="#C56A43" />
            </View>
          ) : notificationsList.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10">
              <Ionicons name="notifications-off-outline" size={40} color="#E0D7D3" />
              <Text className="text-[#8A7A75] mt-4 font-medium">
                Nenhuma notificação por enquanto
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {notificationsList.map((notif, index) => (
                <View 
                  key={index}
                  className={`flex-row p-4 mb-3 rounded-2xl border ${notif.isNew ? 'bg-[#FDF2EE] border-[#FADCD0]' : 'bg-white border-[#E8DFDA]'}`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${notif.isNew ? 'bg-[#C56A43]' : 'bg-[#F0EBE6]'}`}>
                    <MaterialCommunityIcons 
                      name={notif.icon} 
                      size={20} 
                      color={notif.isNew ? "#FFF" : "#8A7A75"} 
                    />
                  </View>
                  <View className="flex-1 justify-center">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className={`text-sm font-bold ${notif.isNew ? 'text-[#2C221E]' : 'text-[#8A7A75]'}`}>
                        {notif.title}
                      </Text>
                      {notif.isNew && (
                        <View className="bg-[#C56A43] px-2 py-0.5 rounded-full">
                          <Text className="text-[10px] text-white font-bold">NOVA</Text>
                        </View>
                      )}
                    </View>
                    <Text className={`text-xs ${notif.isNew ? 'text-[#2C221E]' : 'text-[#8A7A75]'}`}>
                      {notif.message}
                    </Text>
                    <Text className="text-[10px] text-[#A37262] mt-1.5 font-medium">
                      {notif.date.toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
