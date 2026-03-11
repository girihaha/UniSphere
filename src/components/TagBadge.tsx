interface TagBadgeProps {
  label: string;
  variant?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'default';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variants = {
  blue:    'bg-blue-500/15    text-blue-300    border-blue-500/25',
  violet:  'bg-violet-500/15  text-violet-300  border-violet-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  amber:   'bg-amber-500/15   text-amber-300   border-amber-500/25',
  rose:    'bg-rose-500/15    text-rose-300    border-rose-500/25',
  cyan:    'bg-cyan-500/15    text-cyan-300    border-cyan-500/25',
  default: 'bg-white/8        text-white/55    border-white/12',
};

const dotColors = {
  blue:    'bg-blue-400',
  violet:  'bg-violet-400',
  emerald: 'bg-emerald-400',
  amber:   'bg-amber-400',
  rose:    'bg-rose-400',
  cyan:    'bg-cyan-400',
  default: 'bg-white/50',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-[3px] text-[11px] gap-1.5',
};

export default function TagBadge({ label, variant = 'default', size = 'md', dot = false }: TagBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        font-semibold tracking-wide
        rounded-full border
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />}
      {label}
    </span>
  );
}
