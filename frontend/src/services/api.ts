/**
 * Serviço de API para comunicação com o backend Django
 */

import type {
  LoginRequest,
  LoginResponse,
  CadastroRequest,
  CadastroResponse,
  PasswordResetRequestData,
  PasswordResetConfirmData
} from '@/types/auth.types';

// Configuração da URL base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Classe para gerenciar requisições à API
 */
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Método genérico para fazer requisições
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Adiciona token se estiver disponível
    if (token && !endpoint.includes('login') && !endpoint.includes('cadastro')) {
      headers['Authorization'] = `Token ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log('Requisição:', { url, method: config.method, body: config.body });
      const response = await fetch(url, config);
      console.log('Response status:', response.status);

      // Se a resposta não for ok, lança erro
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.error || errorData.detail || 'Erro na requisição');
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  /**
   * Faz login do usuário
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/logout/', {
      method: 'POST',
    });
  }

  /**
   * Cadastra novo usuário
   */
  async cadastro(data: CadastroRequest): Promise<CadastroResponse> {
    return this.request<CadastroResponse>('/cadastro/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Solicita reset de senha (envia código por email)
   */
  async requestPasswordReset(data: PasswordResetRequestData): Promise<{ message: string; email: string; expires_in: string }> {
    return this.request('/password-reset/request/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Confirma reset de senha com código
   */
  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<{ message: string }> {
    return this.request('/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Exporta instância do serviço
export const api = new ApiService(API_BASE_URL);
