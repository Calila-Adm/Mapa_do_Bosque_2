import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import grupoJccLogo from '../assets/Grupo JCC.svg';
import videoSource from '../assets/Vídeo Institucional Grupo JCC.mp4';

/**
 * Página inicial (Landing Page)
 * Exibe vídeo institucional com CTA para login
 */
export function Home() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Garantir que o vídeo tente reproduzir automaticamente
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Autoplay bloqueado pelo navegador:', error);
      });
    }
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="relative w-full min-h-[200vh] flex flex-col items-center">
      {/* Vídeo de fundo */}
      <div className="fixed top-0 left-0 w-full h-full min-h-screen z-[1]">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            videoLoaded ? 'opacity-70' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src={videoSource} type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
      </div>

      {/* Overlay com gradiente */}
      <div className="fixed top-0 left-0 w-full h-full min-h-screen bg-[rgba(13,13,13,0.7)] z-[2]" />

      {/* Hero Section - Primeira tela */}
      <div className="relative z-[3] flex flex-col items-center justify-center text-center p-12 w-full min-h-screen gap-8">
        {/* Logo */}
        <img
          src={grupoJccLogo}
          alt="Logo Grupo JCC"
          className="w-[300px] h-auto mb-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
        />

        {/* Título */}
        <h1 className="text-6xl font-bold text-secondary m-0 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] leading-tight">
          Bem-vindo ao <span className="text-primary font-bold">Mapa do Bosque</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-3xl font-normal text-secondary m-0 [text-shadow:1px_1px_3px_rgba(0,0,0,0.5)] max-w-[900px]">
          Centralize todos os KPI's dos 3 shoppings do Grupo JCC em um único local.
          Uma iniciativa do time de Digitalização para transformar dados em insights estratégicos.
        </p>

        {/* Call-to-Action - Botão com fundo amarelo e bordas arredondadas */}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <Button
            size="lg"
            onClick={handleLoginClick}
            className="min-w-[250px] bg-primary text-dark hover:bg-primary/90 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Acessar Sistema
          </Button>
        </div>

        {/* Informação adicional */}
        <p className="text-sm text-gray-200 -mt-6 [text-shadow:1px_1px_3px_rgba(0,0,0,0.8)]">
          Faça login para acessar sua conta
        </p>
      </div>

      {/* Conteúdo adicional - Scrollável */}
      <div className="relative z-[3] flex flex-col items-center text-center p-16 w-full gap-12">
        <h2 className="text-4xl font-bold text-primary mb-6">
          Sobre o Mapa do Bosque
        </h2>

        <p className="text-xl text-secondary max-w-[800px] leading-relaxed mb-8">
          O Mapa do Bosque é uma plataforma integrada que reúne dados e indicadores-chave
          de desempenho (KPIs) dos três shoppings do Grupo JCC, proporcionando uma visão
          estratégica unificada para tomada de decisões.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1200px] mt-12">
          {/* Card 1 */}
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-8 text-center hover:bg-primary/20 transition-colors">
            <h3 className="text-primary text-2xl font-semibold mb-4">
              📊 Dados Centralizados
            </h3>
            <p className="text-secondary text-base">
              Todos os KPIs em um único dashboard
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-8 text-center hover:bg-primary/20 transition-colors">
            <h3 className="text-primary text-2xl font-semibold mb-4">
              🎯 Insights Estratégicos
            </h3>
            <p className="text-secondary text-base">
              Transforme dados em decisões inteligentes
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-8 text-center hover:bg-primary/20 transition-colors">
            <h3 className="text-primary text-2xl font-semibold mb-4">
              🚀 Digitalização
            </h3>
            <p className="text-secondary text-base">
              Inovação do time de Digitalização
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
