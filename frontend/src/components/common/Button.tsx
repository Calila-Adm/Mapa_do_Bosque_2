import React from 'react';
import { ButtonProps } from '../../types';
import { theme } from '../../styles/theme';

/**
 * Componente Button reutilizável
 * Suporta diferentes variantes, tamanhos e estados
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  // Estilos base
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: theme.transitions.normal,
    fontFamily: 'inherit',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || isLoading ? 0.6 : 1,
    position: 'relative',
  };

  // Estilos por variante
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.dark,
      boxShadow: theme.shadows.md,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.dark,
      border: `2px solid ${theme.colors.tertiary}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      border: `2px solid ${theme.colors.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
    },
  };

  // Estilos por tamanho
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: '0.875rem',
      borderRadius: theme.borderRadius.md,
    },
    md: {
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
      fontSize: '1rem',
      borderRadius: theme.borderRadius.md,
    },
    lg: {
      padding: `${theme.spacing.lg} ${theme.spacing['2xl']}`,
      fontSize: '1.125rem',
      borderRadius: theme.borderRadius.lg,
    },
  };

  // Efeitos de hover (via pseudo-classe no style não funciona, vou usar classes CSS)
  const hoverClass = `button-hover-${variant}`;

  return (
    <>
      <style>{`
        .button-hover-primary:hover:not(:disabled) {
          background-color: ${theme.colors.primaryDark};
          transform: translateY(-2px);
          box-shadow: ${theme.shadows.lg};
        }
        .button-hover-secondary:hover:not(:disabled) {
          background-color: ${theme.colors.gray.light};
          transform: translateY(-2px);
        }
        .button-hover-outline:hover:not(:disabled) {
          background-color: ${theme.colors.primary};
          color: ${theme.colors.dark};
          transform: translateY(-2px);
        }
        .button-hover-ghost:hover:not(:disabled) {
          background-color: rgba(252, 181, 33, 0.1);
        }
      `}</style>
      <button
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...sizeStyles[size],
        }}
        className={`${hoverClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span style={{ marginRight: theme.spacing.sm }}>⏳</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    </>
  );
}
