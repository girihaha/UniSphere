import { Hash, Rss, Users, User } from 'lucide-react';

type Tab = 'clubs' | 'feed' | 'network' | 'profile';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Hash }[] = [
  { id: 'clubs', label: 'Clubs', icon: Hash },
  { id: 'feed', label: 'Feed', icon: Rss },
  { id: 'network', label: 'Network', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div
      className="fixed bottom-0 z-30 flex justify-center pointer-events-none"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
      }}
    >
      <nav
        className="pointer-events-auto mx-4 mb-5 rounded-4xl px-2 py-2 flex items-center w-full"
        style={{
          background: 'rgba(10, 14, 26, 0.82)',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow:
            '0 -4px 32px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;

          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="
                flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1
                rounded-3xl transition-all duration-250 active:scale-95
              "
            >
              <div
                className={`
                  relative flex items-center justify-center
                  w-11 h-8 rounded-2xl transition-all duration-300
                  ${isActive ? 'gradient-accent shadow-accent' : 'hover:bg-white/6'}
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl gradient-accent opacity-20 blur-md" />
                )}
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-white/35'
                  }`}
                />
              </div>

              <span
                className={`
                  text-[9px] font-bold tracking-wider uppercase transition-all duration-200
                  ${isActive ? 'text-white' : 'text-white/25'}
                `}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}