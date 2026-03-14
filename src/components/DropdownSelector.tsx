import { ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function DropdownSelector({ options, value, onChange, className = '' }: DropdownSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="
          glass-card
          flex items-center gap-2
          px-3.5 py-2
          rounded-2xl
          text-sm font-semibold text-white
          transition-all duration-200
          active:scale-[0.97]
          min-w-[110px]
          justify-between
        "
      >
        <span className="text-white/80">{selected?.label}</span>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`text-white/40 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="
          absolute top-full mt-2 right-0
          glass-dark
          rounded-2xl
          overflow-hidden
          z-50
          min-w-[140px]
          shadow-glass-lg
          scale-in
          border border-white/10
        ">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`
                w-full text-left px-4 py-2.5 text-sm font-medium
                flex items-center justify-between gap-3
                transition-colors duration-150
                ${opt.value === value
                  ? 'text-primary-300 bg-primary-500/12'
                  : 'text-white/65 hover:text-white hover:bg-white/6'
                }
              `}
            >
              {opt.label}
              {opt.value === value && (
                <Check size={13} className="text-primary-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
