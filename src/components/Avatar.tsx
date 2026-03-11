interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
  status?: 'online' | 'offline' | null;
}

const sizes = {
  xs:  'w-6  h-6  text-[9px]',
  sm:  'w-8  h-8  text-[10px]',
  md:  'w-10 h-10 text-xs',
  lg:  'w-14 h-14 text-sm',
  xl:  'w-20 h-20 text-lg',
  '2xl': 'w-28 h-28 text-2xl',
};

const statusDotSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2   h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3   h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const gradients = [
  'from-blue-500    to-indigo-600',
  'from-cyan-500    to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500  to-rose-600',
  'from-violet-500  to-fuchsia-600',
  'from-amber-500   to-orange-600',
  'from-indigo-500  to-violet-600',
  'from-teal-500    to-cyan-600',
];

function getGradient(name: string) {
  const index = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % gradients.length;
  return gradients[index];
}

export default function Avatar({ src, name = '', size = 'md', className = '', ring = false, status = null }: AvatarProps) {
  const ringClass = ring
    ? 'ring-2 ring-primary-500/50 ring-offset-2 ring-offset-transparent'
    : '';

  const imgOrAvatar = src ? (
    <img
      src={src}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${ringClass}`}
    />
  ) : (
    <div
      className={`
        ${sizes[size]}
        rounded-full
        bg-gradient-to-br ${getGradient(name)}
        flex items-center justify-center
        font-bold text-white
        flex-shrink-0
        ${ringClass}
      `}
    >
      {getInitials(name)}
    </div>
  );

  if (!status) {
    return <div className={`relative inline-flex flex-shrink-0 ${className}`}>{imgOrAvatar}</div>;
  }

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {imgOrAvatar}
      <span
        className={`
          absolute bottom-0 right-0
          ${statusDotSizes[size]}
          rounded-full
          border-2 border-[#0a0e1a]
          ${status === 'online' ? 'bg-emerald-400' : 'bg-white/20'}
        `}
      />
    </div>
  );
}
