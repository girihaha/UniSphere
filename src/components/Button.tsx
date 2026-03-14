import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  fullWidth = false,
  icon,
  disabled = false,
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-2xl
    transition-all duration-200
    active:scale-[0.95]
    select-none
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      gradient-accent text-white shadow-accent
      hover:shadow-accent-lg hover:brightness-110
    `,
    secondary: `
      glass text-white/80 hover:text-white
      hover:bg-white/10 border border-white/10
    `,
    ghost: `
      text-white/60 hover:text-white
      hover:bg-white/6
    `,
    outline: `
      border border-primary-500/40 text-primary-400
      hover:bg-primary-500/10 hover:border-primary-500/60
    `,
    danger: `
      border border-rose-500/30 text-rose-400
      hover:bg-rose-500/10
    `,
  };

  const sizes = {
    xs: 'px-2.5 py-1   text-[11px]',
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5   py-2.5 text-sm',
    lg: 'px-6   py-3.5 text-[15px]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
