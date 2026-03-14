import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
}: SearchBarProps) {
  const [internal, setInternal] = useState('');
  const val = value !== undefined ? value : internal;

  const handleChange = (v: string) => {
    if (onChange) onChange(v);
    else setInternal(v);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={15}
        className="absolute left-4 text-white/35 pointer-events-none"
        strokeWidth={2.5}
      />
      <input
        type="text"
        value={val}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          glass-card
          rounded-2xl
          pl-10 pr-10 py-3
          text-sm font-medium
          text-white
          placeholder-white/25
          outline-none
          transition-all duration-200
          bg-transparent
        "
      />
      {val && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3.5 p-0.5 text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
