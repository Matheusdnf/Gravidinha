import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Gestacao, AuthContextType } from '../types/auth';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedGestacao, setSelectedGestacaoState] = useState<Gestacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data, error }, storedUser, storedGestacao] = await Promise.all([
          supabase.auth.getSession(),
          AsyncStorage.getItem('gravidinha_user'),
          AsyncStorage.getItem('gravidinha_selected_gestacao'),
        ]);

        // Sem sessão do Supabase (nunca logou, saiu ou login antigo da API própria): força novo login.
        // Com sessão, o supabase-js renova o token sozinho.
        // Erro de rede na renovação (app aberto offline) não desloga: o supabase-js mantém a
        // sessão guardada e tenta de novo; se o token for revogado, o SIGNED_OUT abaixo desloga.
        if (storedUser && (data.session || isAuthRetryableFetchError(error))) {
          setUser(JSON.parse(storedUser));
        } else {
          await AsyncStorage.multiRemove(['gravidinha_user', 'gravidinha_selected_gestacao']);
          return;
        }
        if (storedGestacao) {
          setSelectedGestacaoState(JSON.parse(storedGestacao));
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();

    // Sessão encerrada fora do app (ex.: token de renovação revogado): volta para o login
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSelectedGestacaoState(null);
        AsyncStorage.multiRemove(['gravidinha_user', 'gravidinha_selected_gestacao']);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('gravidinha_user', JSON.stringify(userData));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedGestacaoState(null);
    await AsyncStorage.multiRemove(['gravidinha_user', 'gravidinha_selected_gestacao']);
  };

  const setSelectedGestacao = async (gestacao: Gestacao | null) => {
    setSelectedGestacaoState(gestacao);
    if (gestacao) {
      await AsyncStorage.setItem('gravidinha_selected_gestacao', JSON.stringify(gestacao));
    } else {
      await AsyncStorage.removeItem('gravidinha_selected_gestacao');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, selectedGestacao, setSelectedGestacao }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
