/**
 * Context de Autenticação
 * Gerencia estado global de autenticação do usuário
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/services/api';
import type {
  User,
  AuthContextType,
  CadastroRequest,
  PasswordResetConfirmData
} from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega token do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // TODO: Buscar dados do usuário com o token
      // Por enquanto, apenas marca como autenticado
    }
    setIsLoading(false);
  }, []);

  /**
   * Faz login do usuário
   */
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ username, password });

      // Salva token no localStorage
      localStorage.setItem('token', response.token);
      setToken(response.token);

      // TODO: Buscar dados completos do usuário
      // Por enquanto, cria um usuário básico
      setUser({
        id: 0,
        username,
        email: '',
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Faz logout do usuário
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Remove token do localStorage
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  /**
   * Cadastra novo usuário
   */
  const cadastro = async (data: CadastroRequest) => {
    try {
      setIsLoading(true);
      const response = await api.cadastro(data);

      // Salva token no localStorage
      localStorage.setItem('token', response.token);
      setToken(response.token);

      // Cria usuário básico
      setUser({
        id: 0,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        cargo: data.cargo,
        setor: data.setor,
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Solicita reset de senha
   */
  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      await api.requestPasswordReset({ email });
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Confirma reset de senha
   */
  const confirmPasswordReset = async (data: PasswordResetConfirmData) => {
    try {
      setIsLoading(true);
      await api.confirmPasswordReset(data);
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao confirmar reset de senha:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    cadastro,
    requestPasswordReset,
    confirmPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
