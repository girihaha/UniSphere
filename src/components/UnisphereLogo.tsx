interface UnisphereLogoProps {
  size?: number;
  className?: string;
}

export function UnisphereIcon({ size = 28, className = '' }: UnisphereLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Unisphere"
    >
      <circle cx="16" cy="16" r="11.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" />
      <ellipse cx="16" cy="16" rx="5.5" ry="11.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="4.5" y1="16" x2="27.5" y2="16" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
      <line x1="7" y1="10" x2="25" y2="10" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="7" y1="22" x2="25" y2="22" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="16" cy="16" r="1.5" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

interface UnisphereWordmarkProps {
  iconSize?: number;
  className?: string;
  showSubtitle?: boolean;
}

export function UnisphereWordmark({ iconSize = 28, className = '', showSubtitle = false }: UnisphereWordmarkProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="flex items-center justify-center rounded-3xl mb-4"
        style={{
          width: iconSize * 2,
          height: iconSize * 2,
          background: 'linear-gradient(145deg, #1a1f36 0%, #0d1224 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <UnisphereIcon size={iconSize} />
      </div>
      <h1
        className="text-3xl font-extrabold text-white mb-1"
        style={{ letterSpacing: '-0.04em' }}
      >
        Unisphere
      </h1>
      {showSubtitle && (
        <p className="text-[13px] text-white/40 font-medium">Your university social network</p>
      )}
    </div>
  );
}

interface UnisphereInlineProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function UnisphereInline({ size = 'md', className = '' }: UnisphereInlineProps) {
  const iconSize = size === 'sm' ? 14 : 18;
  const containerSize = size === 'sm' ? 32 : 40;
  const borderRadius = size === 'sm' ? '0.625rem' : '0.75rem';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: containerSize,
          height: containerSize,
          background: 'linear-gradient(145deg, #1a1f36 0%, #0d1224 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <UnisphereIcon size={iconSize} />
      </div>
      <span
        className={`font-extrabold text-white tracking-tight ${size === 'sm' ? 'text-base' : 'text-lg'}`}
        style={{ letterSpacing: '-0.03em' }}
      >
        Unisphere
      </span>
    </div>
  );
}
