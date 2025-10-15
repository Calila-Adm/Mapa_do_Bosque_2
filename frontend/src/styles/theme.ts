/**
 * Tema da aplicação - Grupo JCC
 * Cores oficiais e constantes de estilo
 */

export const theme = {
  // Tipografia
  fonts: {
    primary: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    heading: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    body: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },

  colors: {
    // Cores principais
    primary: '#FCB521',      // Amarelo vibrante (cor principal)
    secondary: '#FBFBFB',    // Branco gelo
    tertiary: '#9C9C9C',     // Cinza médio
    dark: '#0D0D0D',         // Quase preto (textos)

    // Variações úteis
    primaryDark: '#E09E0F',  // Amarelo mais escuro (hover)
    primaryLight: '#FDCA4D', // Amarelo mais claro
    gray: {
      light: '#F5F5F5',
      medium: '#9C9C9C',
      dark: '#5A5A5A',
    },
    white: '#FFFFFF',
    black: '#000000',

    // Estados
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },

  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '1rem',       // 16px
    full: '9999px',   // Círculo
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Theme = typeof theme;
