import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/common/Button';
import { theme } from '../styles/theme';
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

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '200vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const videoContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    zIndex: 1,
  };

  const videoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: videoLoaded ? 0.7 : 0,
    transition: 'opacity 0.5s ease',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    backgroundColor: 'rgba(13, 13, 13, 0.7)',
    zIndex: 2,
  };

  const heroSectionStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: theme.spacing['2xl'],
    width: '100%',
    minHeight: '100vh',
    gap: theme.spacing.xl,
  };

  const additionalContentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing['4xl'],
    width: '100%',
    gap: theme.spacing['2xl'],
  };

  const logoStyle: React.CSSProperties = {
    width: '250px',
    height: 'auto',
    marginBottom: theme.spacing.xl,
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '4rem',
    fontWeight: 700,
    color: theme.colors.secondary,
    margin: 0,
    textShadow: `2px 2px 4px rgba(0, 0, 0, 0.5)`,
    lineHeight: 1.2,
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 400,
    color: theme.colors.secondary,
    margin: 0,
    textShadow: `1px 1px 3px rgba(0, 0, 0, 0.5)`,
    maxWidth: '900px',
  };

  const highlightStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontWeight: 700,
  };

  const ctaContainerStyle: React.CSSProperties = {
    marginTop: theme.spacing.xl,
    display: 'flex',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      {/* Vídeo de fundo */}
      <div style={videoContainerStyle}>
        <video
          ref={videoRef}
          style={videoStyle}
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
      <div style={overlayStyle} />

      {/* Hero Section - Primeira tela */}
      <div style={heroSectionStyle}>
        {/* Logo */}
        <img src={grupoJccLogo} alt="Logo Grupo JCC" style={logoStyle} />

        {/* Título */}
        <h1 style={headingStyle}>
          Bem-vindo ao <span style={highlightStyle}>Mapa do Bosque</span>
        </h1>

        {/* Subtítulo */}
        <p style={subheadingStyle}>
          Centralize todos os KPI's dos 3 shoppings do Grupo JCC em um único local.
          Uma iniciativa do time de Digitalização para transformar dados em insights estratégicos.
        </p>

        {/* Call-to-Action */}
        <div style={ctaContainerStyle}>
          <Button
            variant="primary"
            size="lg"
            onClick={handleLoginClick}
            style={{
              minWidth: '250px',
            }}
          >
            Acessar Sistema
          </Button>
        </div>

        {/* Informação adicional */}
        <p
          style={{
            fontSize: '0.875rem',
            color: theme.colors.tertiary,
            marginTop: theme.spacing.lg,
            textShadow: `1px 1px 2px rgba(0, 0, 0, 0.5)`,
          }}
        >
          Faça login para acessar sua conta
        </p>
      </div>

      {/* Conteúdo adicional - Scrollável */}
      <div style={additionalContentStyle}>
        <h2
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: theme.colors.primary,
            marginBottom: theme.spacing.lg,
          }}
        >
          Sobre o Mapa do Bosque
        </h2>

        <p
          style={{
            fontSize: '1.25rem',
            color: theme.colors.secondary,
            maxWidth: '800px',
            lineHeight: 1.8,
            marginBottom: theme.spacing.xl,
          }}
        >
          O Mapa do Bosque é uma plataforma integrada que reúne dados e indicadores-chave
          de desempenho (KPIs) dos três shoppings do Grupo JCC, proporcionando uma visão
          estratégica unificada para tomada de decisões.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: theme.spacing.xl,
            width: '100%',
            maxWidth: '1200px',
            marginTop: theme.spacing['2xl'],
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              backgroundColor: 'rgba(252, 181, 33, 0.1)',
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: theme.colors.primary, fontSize: '1.5rem', marginBottom: theme.spacing.md }}>
              📊 Dados Centralizados
            </h3>
            <p style={{ color: theme.colors.secondary, fontSize: '1rem' }}>
              Todos os KPIs em um único dashboard
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: 'rgba(252, 181, 33, 0.1)',
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: theme.colors.primary, fontSize: '1.5rem', marginBottom: theme.spacing.md }}>
              🎯 Insights Estratégicos
            </h3>
            <p style={{ color: theme.colors.secondary, fontSize: '1rem' }}>
              Transforme dados em decisões inteligentes
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              backgroundColor: 'rgba(252, 181, 33, 0.1)',
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: theme.colors.primary, fontSize: '1.5rem', marginBottom: theme.spacing.md }}>
              🚀 Digitalização
            </h3>
            <p style={{ color: theme.colors.secondary, fontSize: '1rem' }}>
              Inovação do time de Digitalização
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
