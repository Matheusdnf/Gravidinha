import { Feather } from "@expo/vector-icons";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../state/auth";
import { atualizarUsuario, buscarUsuario, salvarFotoPerfil } from "../../lib/dados";
import { useDadosAtualizados } from "../../lib/sync";
import { idade, mascaraCelular } from "../../lib/formato";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

// Componentes Modulares da Arquitetura
import { ProfileMenuOptions } from "../../components/perfil/ProfileMenuOptions";
import { BottomSheetModal } from "../../components/BottomSheetModal";

// Mocks Isolados
import { MENU_PERFIL } from "../../constants/menuPerfil";
import { useCores } from "../../lib/tema";

export default function PerfilScreen() {
  const cores = useCores();
  const { user, signIn, signOut } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nome, setNome] = useState(user?.nome || "");
  const [celular, setCelular] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [nascimento, setNascimento] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  // Busca as informações completas do usuário (incluindo celular e foto) do banco
  const carregar = () => {
    if (user) {
      buscarUsuario()
        .then((data) => {
          setNome(data.nome);
          if (data.celular) {
            setCelular(mascaraCelular(data.celular));
          }
          if (data.profile_image) {
            setProfileImage(data.profile_image);
          }
          setNascimento(data.data_nascimento);
        })
        .catch(console.error);
    }
  };
  useEffect(carregar, [user?.id]);
  // Não sobrescreve o que a usuária está digitando no modal de edição
  useDadosAtualizados(() => {
    if (!isModalVisible) carregar();
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const anterior = profileImage;
      setProfileImage(uri); // mostra na hora; volta à anterior se o envio falhar
      setEnviandoFoto(true);
      salvarFotoPerfil(uri)
        .catch((e) => {
          setProfileImage(anterior);
          Alert.alert("Erro", e.message);
        })
        .finally(() => setEnviandoFoto(false));
    }
  };

  const handleSave = async () => {
    if (!nome) {
      Alert.alert("Atenção", "O nome não pode ficar vazio.");
      return;
    }

    setIsLoading(true);
    try {
      // A foto já foi salva em pickImage
      await atualizarUsuario({ nome, celular });
      Alert.alert("Sucesso", "Informações atualizadas com sucesso!");
      setIsModalVisible(false);
      if (user) {
        signIn({ ...user, nome, celular });
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fundo">
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
                className="w-16 h-16 rounded-full bg-[#D97D54]/80 items-center justify-center border-2 border-cartao shadow-sm overflow-hidden"
              >
                <FotoPerfil
                  uri={profileImage}
                  enviando={enviandoFoto}
                  semFoto={<Text className="text-3xl pt-1 pr-1">👩‍🍼 </Text>}
                />
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
                  borderColor: cores.cartao,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="camera" size={11} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xl font-extrabold text-texto tracking-tight">
                {user?.nome}
              </Text>
              <Text className="text-xs text-texto-suave font-medium mt-0.5">
                {user?.email}
              </Text>
              {nascimento && (
                <Text className="text-xs text-texto-suave font-medium mt-0.5">
                  {idade(nascimento)} anos
                </Text>
              )}
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
            className="w-10 h-10 rounded-full bg-cartao border border-borda items-center justify-center ml-3 shadow-sm"
            activeOpacity={0.7}
            onPress={() => setIsModalVisible(true)}
          >
            <Feather name="edit-2" size={16} color={cores.marrom} />
          </TouchableOpacity>
        </View>

        {/* 5. SEÇÃO: Menu de Opções */}
        <Text className="text-xs font-extrabold text-texto-suave tracking-wider uppercase mb-2">
          Minha Gestação
        </Text>
        <View className="bg-cartao border border-borda rounded-[28px] px-5 py-2 w-full mb-6">
          {MENU_PERFIL.map((option) => (
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

        <Text className="text-xs font-extrabold text-texto-suave tracking-wider uppercase mb-2">
          Conta
        </Text>
        <View className="bg-cartao border border-borda rounded-[28px] px-5 py-2 w-full mb-6">
          <ProfileMenuOptions
            id="configuracoes"
            title="Configurações"
            subtitle="Aparência do app"
            iconName="cog-outline"
            iconColor="#78716C"
            bgColor="bg-creme"
          />
        </View>

        {/* Botão Sair */}
        <TouchableOpacity
          className="bg-vermelho border border-vermelho-borda rounded-2xl py-4 flex-row items-center justify-center w-full shadow-sm"
          activeOpacity={0.7}
          // O _layout leva para o login quando a sessão acaba (signOut pode ser cancelado)
          onPress={signOut}
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
              className="w-20 h-20 rounded-full bg-[#D97D54]/80 items-center justify-center border-4 border-cartao shadow-sm overflow-hidden relative"
            >
              <FotoPerfil
                uri={profileImage}
                enviando={enviandoFoto}
                semFoto={<Text className="text-4xl pt-1">👩‍🍼</Text>}
              />
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
            <Text className="text-xs font-bold text-texto mb-2">
              Nome Completo
            </Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor={cores.textoFraco}
              className="bg-pessego border border-pessego-borda rounded-2xl px-4 py-3.5 text-sm text-texto"
            />
          </View>

          {/* Campo Celular */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-texto mb-2">
              Celular
            </Text>
            <TextInput
              value={celular}
              onChangeText={(t) => setCelular(mascaraCelular(t))}
              keyboardType="numeric"
              placeholder="(00) 00000-0000"
              placeholderTextColor={cores.textoFraco}
              maxLength={15}
              className="bg-pessego border border-pessego-borda rounded-2xl px-4 py-3.5 text-sm text-texto"
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-texto mb-2">
              E-mail (Não editável)
            </Text>
            <TextInput
              value={user?.email || ''}
              editable={false}
              className="bg-creme border border-borda-forte rounded-2xl px-4 py-3.5 text-sm text-texto-suave"
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className="bg-[#D97D54] active:bg-[#C56A43] rounded-2xl py-4 items-center justify-center shadow-sm mt-4"
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

// Foto do avatar com um loading por cima enquanto ela é enviada ou baixada
function FotoPerfil({ uri, enviando, semFoto }: { uri: string | null; enviando: boolean; semFoto: React.ReactNode }) {
  const [baixando, setBaixando] = useState(false);
  // Callbacks estáveis: no web o <Image> recarrega sempre que eles mudam (loop infinito)
  const inicio = useCallback(() => setBaixando(true), []);
  const fim = useCallback(() => setBaixando(false), []);
  if (!uri) return semFoto;
  return (
    <>
      <Image source={{ uri }} className="w-full h-full" onLoadStart={inicio} onLoadEnd={fim} />
      {(enviando || baixando) && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
    </>
  );
}
