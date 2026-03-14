import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'dark' | 'elevated';
  onClick?: () => void;
  padding?: boolean;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  onClick,
  padding = true,
  hover = false,
  glow = false,
}: GlassCardProps) {
  const variantClass = {
    default:  'glass-card',
    strong:   'glass-strong',
    dark:     'glass-dark',
    elevated: 'glass-card shadow-glass-lg',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`
        ${variantClass}
        rounded-3xl
        shadow-glass
        ${padding ? 'p-4' : ''}
        ${hover ? 'card-hover' : ''}
        ${glow ? 'shadow-glow' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
