import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  fullWidth = true,
  style,
  ...props 
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '56px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 600,
    padding: '0 24px',
    width: fullWidth ? '100%' : 'auto',
    transition: 'opacity 0.2s',
    ...style,
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-primary-contrast)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: '#FFFFFF',
      border: 'none',
    }
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant] }} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
