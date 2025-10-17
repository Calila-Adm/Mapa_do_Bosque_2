/**
 * Componente de Rota Protegida
 * Redireciona para login se o usuário não estiver autenticado
 */

import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Enquanto está carregando, não mostra nada (ou pode mostrar um loading)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza o componente filho
  return <>{children}</>;
}
