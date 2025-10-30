import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import grupoJccLogo from '../../assets/Grupo JCC.svg';

/**
 * Página de Login - Design baseado na imagem de referência
 * Ajustado para ficar idêntico ao Login.png
 */
export function LoginFigma() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50 flex items-center justify-center">
      {/* Container com tamanho máximo */}
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] bg-white flex flex-col lg:flex-row shadow-2xl rounded-[20px] overflow-hidden">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 bg-white z-10 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo JCC */}
        <div className="mb-12">
          <img
            src={grupoJccLogo}
            alt="Logo Grupo JCC"
            className="w-[150px] h-auto object-contain"
          />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="w-full max-w-[380px]">
          {/* Campo Usuário */}
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-[#fcc40f] text-[15px] font-semibold mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Usuário:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-[48px] bg-[rgba(217, 217, 217, 0.4)] rounded-[14px] px-[18px] text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#fcc40f] transition-all"
              placeholder=""
              required
            />
          </div>

          {/* Campo Senha */}
          <div className="mb-1">
            <label
              htmlFor="password"
              className="block text-[#fcc40f] text-[15px] font-semibold mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Senha:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[48px] bg-[rgba(217,217,217,0.4)] rounded-[14px] px-[18px] text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#fcc40f] transition-all"
              placeholder=""
              required
            />
          </div>

          {/* Esqueceu sua senha */}
          <div className="text-right mb-6">
            <button
              type="button"
              className="text-[#fcc40f] text-[12px] hover:underline transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Esqueceu sua senha?
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-800 px-[16px] py-[8px] rounded-[10px] text-[11px]">
              {error}
            </div>
          )}

          {/* Botão Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] bg-[#fcc40f] hover:bg-[#e5b00e] rounded-[14px] text-white text-[17px] font-semibold transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isLoading ? 'Entrando...' : 'Login'}
          </button>

          {/* Link Cadastro */}
          <div className="text-center mt-4">
            <p className="text-[#d0d0d0] text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Ainda nao tem conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/cadastro')}
                className="text-[#fcc40f] font-normal hover:underline transition-all"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Lado Direito - Branding com padrão de folhas */}
      <div className="hidden lg:flex w-full lg:w-1/2 relative items-center justify-center p-[8px]">
        {/* Quadrado amarelo com bordas arredondadas e descolado */}
        <div className="w-full h-full bg-[#fcc40f] rounded-[10px] relative overflow-hidden shadow-lg">
        {/* Padrão de folhas decorativo - mais visível */}
        <div className="absolute inset-0 opacity-40">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leaves-pattern" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
                {/* Folhas maiores e mais visíveis */}
                <ellipse cx="45" cy="45" rx="50" ry="75" fill="rgba(255,255,255,0.25)" transform="rotate(25 45 45)" />
                <ellipse cx="140" cy="90" rx="45" ry="70" fill="rgba(255,255,255,0.25)" transform="rotate(-15 140 90)" />
                <ellipse cx="90" cy="140" rx="55" ry="80" fill="rgba(255,255,255,0.25)" transform="rotate(40 90 140)" />
                <ellipse cx="30" cy="120" rx="40" ry="65" fill="rgba(255,255,255,0.2)" transform="rotate(-30 30 120)" />
                <ellipse cx="160" cy="30" rx="35" ry="60" fill="rgba(255,255,255,0.2)" transform="rotate(60 160 30)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaves-pattern)" />
          </svg>
        </div>

        {/* Container principal do conteúdo */}
        <div className="relative z-10 flex flex-col items-left justify-start w-full h-full pt-3 px-3">
          {/* Texto "Mapa do Bosque" - centralizado no topo */}
          <div
            className="text-white font-bold leading-[0.97] tracking-tight"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(30px, 5.5vw, 50px)',
              letterSpacing: '-0.04em'
            }}
          >
            <p className="mb-0">Mapa</p>
            <p className="mb-0">do</p>
            <p className="mb-0">Bosque</p>
          </div>

          {/* Mockup do celular - maior e mais proeminente */}
          <div
            className="absolute bg-transparent border-[2px] border-grey rounded-[40px] shadow-2xl"
            style={{
              width: '400px',
              height: '500px',
              right: '0%',
              bottom: '-20%',
              transform: 'rotate(-60deg)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.45)'
            }}
          >
            {/* Borda preta interna */}
            <div className="w-full h-full border-[8px] border-black rounded-[40px] flex items-center justify-center">
              {/* Tela do celular */}
              <div className="w-full h-full bg-white rounded-[32px]"></div>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default LoginFigma;
