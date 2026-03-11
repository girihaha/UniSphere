import { useState } from 'react';
import {
  Bell, UserPlus, CheckCircle2, XCircle,
  Hash, FileText, AtSign, Heart,
  StickyNote, Check, X, ChevronRight,
  BellOff,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { Notification, NotificationType } from '../data/notifications';
import Avatar from '../components/Avatar';

type FilterTab = 'all' | 'unread' | 'connections' | 'posts';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'connections', label: 'Connections' },
  { value: 'posts', label: 'Posts' },
];

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string; border: string }
> = {
  connection_request: {
    icon: UserPlus,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.22)',
  },
  post_approved: {
    icon: CheckCircle2,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.22)',
  },
  post_rejected: {
    icon: XCircle,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.22)',
  },
  club_post: {
    icon: Hash,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.22)',
  },
  network_note: {
    icon: StickyNote,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.22)',
  },
  mention: {
    icon: AtSign,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
    border: 'rgba(56,189,248,0.22)',
  },
  interaction: {
    icon: Heart,
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.12)',
    border: 'rgba(251,113,133,0.22)',
  },
};

function NotificationCard({
  notification,
  onRead,
  onConnect,
}: {
  notification: Notification;
  onRead: () => void;
  onConnect: (action: 'accepted' | 'declined') => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;
  const isConnection = notification.type === 'connection_request';
  const isPending = notification.actionState === 'pending';
  const isAccepted = notification.actionState === 'accepted';
  const isDeclined = notification.actionState === 'declined';

  const handleClick = () => {
    if (!notification.read) onRead();
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden mb-2.5 transition-all duration-200 active:scale-[0.99]"
      style={{
        background: notification.read
          ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 100%)',
        border: notification.read
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid rgba(255,255,255,0.13)',
        boxShadow: notification.read
          ? 'none'
          : '0 4px 24px rgba(0,0,0,0.2)',
      }}
      onClick={handleClick}
    >
      {!notification.read && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full"
          style={{ background: config.color }}
        />
      )}

      <div className="flex gap-3 px-4 pt-4 pb-3">
        <div className="relative flex-shrink-0">
          <Avatar name={notification.actor.name} size="md" />
          <div
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: config.bg, border: `1.5px solid ${config.border}` }}
          >
            <Icon size={10} style={{ color: config.color }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white leading-snug">
                {notification.message}
              </p>
              {notification.meta?.postTitle && notification.type !== 'club_post' && (
                <p
                  className="text-[11px] font-bold mt-0.5 truncate"
                  style={{ color: config.color }}
                >
                  "{notification.meta.postTitle}"
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!notification.read && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: config.color }}
                />
              )}
              <p className="text-[10px] text-white/25 font-medium whitespace-nowrap">
                {notification.timestamp}
              </p>
            </div>
          </div>

          {notification.actor.role && (
            <p className="text-[10px] text-white/30 mt-0.5">{notification.actor.role}</p>
          )}
        </div>
      </div>

      {isConnection && (
        <div
          className="flex gap-2 px-4 pb-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {isPending ? (
            <>
              <button
                onClick={() => onConnect('declined')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 mt-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                <X size={12} />
                Decline
              </button>
              <button
                onClick={() => onConnect('accepted')}
                className="flex-[2] flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95 mt-3"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  boxShadow: '0 3px 12px rgba(59,130,246,0.3)',
                }}
              >
                <UserPlus size={12} />
                Accept
              </button>
            </>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold mt-3"
              style={{
                background: isAccepted ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isAccepted ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
                color: isAccepted ? '#34d399' : 'rgba(255,255,255,0.3)',
              }}
            >
              {isAccepted ? <Check size={11} /> : <X size={11} />}
              {isAccepted ? 'Connected' : 'Declined'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-5 first:mt-0">
      <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.12em] whitespace-nowrap">
        {label}
      </p>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

function groupByTime(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'Earlier': [],
  };

  for (const n of notifications) {
    const age = now - n.timestampMs;
    if (age < oneDay) groups['Today'].push(n);
    else if (age < 2 * oneDay) groups['Yesterday'].push(n);
    else groups['Earlier'].push(n);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default function NotificationsPage({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, respondToConnection } = useNotifications();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'connections') return n.type === 'connection_request';
    if (filter === 'posts') return n.type === 'post_approved' || n.type === 'post_rejected' || n.type === 'club_post';
    return true;
  });

  const groups = groupByTime(filtered);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: '#0a0e1a' }}
    >
      <div className="mx-auto w-full max-w-[430px] flex flex-col h-full">
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 pt-12 pb-3"
          style={{
            background: 'linear-gradient(180deg, rgba(10,14,26,0.98) 0%, rgba(10,14,26,0.92) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ChevronRight size={17} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.025em' }}>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-white/35">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <Check size={11} />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {FILTER_TABS.map((tab) => {
              const count = tab.value === 'unread' ? unreadCount : undefined;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                  style={{
                    background: filter === tab.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: filter === tab.value ? 'white' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {tab.label}
                  {count !== undefined && count > 0 && (
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <BellOff size={24} className="text-white/20" />
              </div>
              <p className="text-sm font-bold text-white/40">All caught up</p>
              <p className="text-[12px] text-white/20 mt-1">No notifications here</p>
            </div>
          ) : (
            groups.map(({ label, items }) => (
              <div key={label}>
                <GroupHeader label={label} />
                <div className="stagger-children">
                  {items.map((n) => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onRead={() => markAsRead(n.id)}
                      onConnect={(action) => respondToConnection(n.id, action)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
