import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/common/Button';
import { theme } from '../styles/theme';
import jccLogo from '../assets/jcc.svg';

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
      // navigate('/dashboard'); // Quando tiver dashboard
    }, 1500);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.dark} 100%)`,
    padding: theme.spacing.md,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.xl,
    padding: theme.spacing['3xl'],
    width: '100%',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xl,
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  };

  const logoStyle: React.CSSProperties = {
    width: '150px',
    height: 'auto',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '1.875rem',
    fontWeight: 700,
    color: theme.colors.dark,
    textAlign: 'center',
    margin: 0,
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.dark,
  };

  const inputStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    fontSize: '1rem',
    border: `2px solid ${theme.colors.gray.light}`,
    borderRadius: theme.borderRadius.md,
    transition: theme.transitions.fast,
    outline: 'none',
  };

  const linkStyle: React.CSSProperties = {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
    textAlign: 'center',
    cursor: 'pointer',
    transition: theme.transitions.fast,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={logoContainerStyle}>
          <img src={jccLogo} alt="Logo Grupo JCC" style={logoStyle} />
        </div>

        {/* Título */}
        <h1 style={headingStyle}>Acesse sua conta</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Email */}
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.gray.light;
              }}
            />
          </div>

          {/* Senha */}
          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.gray.light;
              }}
            />
          </div>

          {/* Botão de Login */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            fullWidth
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Link voltar */}
        <div
          style={linkStyle}
          onClick={handleBackToHome}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.primaryDark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.primary;
          }}
        >
          ← Voltar para página inicial
        </div>
      </div>
    </div>
  );
}

export default Login;
