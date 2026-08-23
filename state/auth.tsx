import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Gestacao, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedGestacao, setSelectedGestacaoState] = useState<Gestacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Lê ambos os valores em paralelo ao invés de sequencialmente
        const [storedUser, storedGestacao] = await Promise.all([
          AsyncStorage.getItem('gravidinha_user'),
          AsyncStorage.getItem('gravidinha_selected_gestacao'),
        ]);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
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
  }, []);

  const signIn = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('gravidinha_user', JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    setSelectedGestacaoState(null);
    await AsyncStorage.removeItem('gravidinha_user');
    await AsyncStorage.removeItem('gravidinha_selected_gestacao');
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
