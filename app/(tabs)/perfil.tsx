import { Feather, Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { useAuth } from "../../state/auth";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

// Componentes Modulares da Arquitetura
import { ProfileMenuOptions } from "../../components/perfil/ProfileMenuOptions";
import { BottomSheetModal } from "../../components/BottomSheetModal";

// Mocks Isolados
import { mockMenuOptions } from "../../state/mockProfileData";

export default function PerfilScreen() {
  const router = useRouter();
  const { user, signIn, signOut } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nome, setNome] = useState(user?.nome || "");
  const [celular, setCelular] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatCelular = (text: string) => {
    let val = text.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length > 2) {
      val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    }
    if (val.length > 9) {
      val = `${val.substring(0, 10)}-${val.substring(10)}`;
    }
    return val;
  };

  // Busca as informações completas do usuário (incluindo celular e foto) do banco
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user?id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setNome(data.nome);
            if (data.celular) {
              setCelular(formatCelular(data.celular.toString()));
            }
            if (data.profile_image) {
              setProfileImage(data.profile_image);
            }
          }
        })
        .catch(console.error);
    }
  }, [user?.id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduz qualidade pra salvar no DB (idealmente seria S3/Cloudinary)
      base64: true, // Vamos salvar como base64 pra facilitar já que não temos storage S3
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Uri);
      
      // Salva direto no banco pra atualizar a foto rápido
      if (user?.id) {
        fetch("/api/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id, nome, celular, profile_image: base64Uri }),
        }).catch(console.error);
      }
    }
  };

  const handleSave = async () => {
    if (!nome) {
      Alert.alert("Atenção", "O nome não pode ficar vazio.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, nome, celular, profile_image: profileImage }),
      });

      if (res.ok) {
        Alert.alert("Sucesso", "Informações atualizadas com sucesso!");
        setIsModalVisible(false);
        if (user) {
          signIn({ ...user, nome, celular });
        }
      } else {
        const data = await res.json();
        Alert.alert("Erro", data.error || "Erro ao atualizar dados.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  // Conquistas rápidas para a fileira horizontal
  const recentBadges = [
    { id: "1", label: "Início", emoji: "🌱 ", bg: "bg-[#FDF2EE]" },
    { id: "2", label: "Quiz Master", emoji: "🎯 ", bg: "bg-[#FDF0F0]" },
    { id: "3", label: "Leitora", emoji: "📘 ", bg: "bg-[#EEF2FF]" },
    { id: "4", label: "1° Tri", emoji: "🌸 ", bg: "bg-[#FDF2F8]" },
  ];

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
        {/* 1. TOPO: Bloco com Avatar, Nome e Conteúdo Offline */}
        <View className="flex-row items-center justify-between w-full mb-2">
          <View className="flex-row items-center flex-1">
            {/* Avatar com ícone de câmera sobreposto */}
            <View style={{ position: 'relative' }}>
              <View
                className="w-16 h-16 rounded-full bg-[#D97D54]/80 items-center justify-center border-2 border-white shadow-sm overflow-hidden"
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} className="w-full h-full" />
                ) : (
                  <Text className="text-3xl pt-1 pr-1">👩‍🍼 </Text>
                )}
              </View>
              {/* Ícone de câmera para trocar foto */}
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#D97D54',
                  borderWidth: 1.5,
                  borderColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="camera" size={11} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xl font-extrabold text-gray-900 tracking-tight">
                {user?.nome}
              </Text>
              <Text className="text-xs text-gray-500 font-medium mt-0.5">
                {user?.email}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 rounded-full bg-[#4FA3A5]" />
                <Text className="text-[11px] text-[#4FA3A5] font-bold ml-1.5">
                  Conteúdo offline atualizado
                </Text>
              </View>
            </View>
          </View>

          {/* Botão Editar Perfil — abre modal de informações */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white border border-[#F0EBE6] items-center justify-center ml-3 shadow-sm"
            activeOpacity={0.7}
            onPress={() => setIsModalVisible(true)}
          >
            <Feather name="edit-2" size={16} color="#A37262" />
          </TouchableOpacity>
        </View>

        {/* 5. SEÇÃO: Menu de Opções */}
        <Text className="text-xs font-extrabold text-gray-400 tracking-wider uppercase mb-2">
          Minha Gestação
        </Text>
        <View className="bg-white border border-[#F0EBE6] rounded-[28px] px-5 py-2 w-full mb-6">
          {mockMenuOptions.map((option) => (
            <ProfileMenuOptions
              key={option.id}
              id={option.id}
              title={option.title}
              subtitle={option.subtitle}
              iconName={option.iconName}
              iconColor={option.iconColor}
              bgColor={option.bgColor}
            />
          ))}
        </View>

        {/* Botão Sair */}
        <TouchableOpacity
          className="bg-red-50 border border-red-100 rounded-2xl py-4 flex-row items-center justify-center w-full shadow-sm"
          activeOpacity={0.7}
          onPress={() => {
            signOut();
            router.replace("/(auth)/login");
          }}
        >
          <Feather name="log-out" size={18} color="#EF4444" className="mr-2" />
          <Text className="text-red-500 font-bold text-sm ml-2">Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= MODAL DE EDITAR PERFIL ================= */}
      <BottomSheetModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Editar Perfil"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Editar Foto */}
          <View className="items-center mb-6 mt-2">
            <TouchableOpacity 
              onPress={pickImage}
              activeOpacity={0.8}
              className="w-20 h-20 rounded-full bg-[#D97D54]/80 items-center justify-center border-4 border-white shadow-sm overflow-hidden relative"
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" />
              ) : (
                <Text className="text-4xl pt-1">👩‍🍼</Text>
              )}
              {/* Ícone de câmera por cima para deixar claro que é clicável */}
              <View className="absolute bottom-0 w-full h-1/3 bg-black/40 items-center justify-center">
                <Feather name="camera" size={12} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} className="mt-2">
              <Text className="text-[#D97D54] font-bold text-xs">Alterar Foto de Perfil</Text>
            </TouchableOpacity>
          </View>

          {/* Campo Nome */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-[#2C221E] mb-2">
              Nome Completo
            </Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor="#C2B2AC"
              className="bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5 text-sm text-[#2C221E]"
            />
          </View>

          {/* Campo Celular */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-[#2C221E] mb-2">
              Celular
            </Text>
            <TextInput
              value={celular}
              onChangeText={(t) => setCelular(formatCelular(t))}
              keyboardType="numeric"
              placeholder="(00) 00000-0000"
              placeholderTextColor="#C2B2AC"
              maxLength={15}
              className="bg-[#FDF2EE] border border-[#FADCD0] rounded-2xl px-4 py-3.5 text-sm text-[#2C221E]"
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-[#2C221E] mb-2">
              E-mail (Não editável)
            </Text>
            <TextInput
              value={user?.email || ''}
              editable={false}
              className="bg-[#F3ECE6] border border-[#E8DFDA] rounded-2xl px-4 py-3.5 text-sm text-[#8A7A75]"
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className="bg-[#E2B19C] active:bg-[#D97D54] rounded-2xl py-4 items-center justify-center shadow-sm mt-4"
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-base">
                Salvar Alterações
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
