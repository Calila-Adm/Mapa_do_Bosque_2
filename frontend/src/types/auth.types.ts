/**
 * Tipos relacionados à autenticação
 */

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  cargo?: string;
  setor?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface CadastroRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  cargo?: string;
  setor?: string;
}

export interface CadastroResponse {
  message: string;
  token: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetConfirmData {
  email: string;
  code: string;
  new_password: string;
  new_password_confirm: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  cadastro: (data: CadastroRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirmData) => Promise<void>;
}
