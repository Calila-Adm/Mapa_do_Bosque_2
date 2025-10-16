import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import grupoJccLogo from '../assets/Grupo JCC.svg';

/**
 * Página de Login
 * Estrutura básica para autenticação
 */
export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular login (implementar lógica real depois)
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login:', { email, password });
      navigate('/dashboard'); // Redireciona para o Painel de Operações
    }, 1500);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background com gradiente */}
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-dark z-[1]" />

      {/* Overlay escuro */}
      <div className="fixed top-0 left-0 w-full h-full bg-[rgba(13,13,13,0.6)] z-[2]" />

      {/* Card de Login */}
      <div className="relative z-[3] bg-white rounded-lg shadow-xl p-12 w-full max-w-[450px] flex flex-col gap-6">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={grupoJccLogo} alt="Logo Grupo JCC" className="w-[300px] h-auto" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-dark text-center">
          Acesse sua conta
        </h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Botão de Login */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full bg-primary text-dark hover:bg-primary/90 font-semibold mt-2"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Link voltar */}
        <div
          className="text-primary text-sm font-semibold text-center cursor-pointer hover:text-primary/80 transition-colors"
          onClick={handleBackToHome}
        >
          ← Voltar para página inicial
        </div>
      </div>
    </div>
  );
}

export default Login;
