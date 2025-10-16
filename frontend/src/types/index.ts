/**
 * Tipos TypeScript globais da aplicação
 */

// Tipos comuns de componentes
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Tipos de Button
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

// Tipos de usuário (exemplo para futuro)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Tipos de Filtros
export interface FilterValues {
  date: string;
  shopping: string;
  ramo: string;
  categoria: string;
  loja: string;
}

export type ShoppingOption = 'iguatemi-bosque' | 'grao-para' | 'bosque-dos-ipes';

export interface FilterOption {
  value: string;
  label: string;
}

// Tipos de KPI (Key Performance Indicators)
export interface KPIData {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}
