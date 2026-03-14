import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';

interface NotificationBellProps {
  onClick: () => void;
}

export default function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-9 h-9 rounded-2xl transition-all active:scale-90"
      style={{
        background: 'rgba(10,14,26,0.72)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      <Bell size={16} className="text-white/70" strokeWidth={2} />
      {unreadCount > 0 && (
        <div
          className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
          style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
            boxShadow: '0 2px 8px rgba(244,63,94,0.5)',
            fontSize: '9px',
            fontWeight: '900',
            color: 'white',
            lineHeight: 1,
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  );
}
