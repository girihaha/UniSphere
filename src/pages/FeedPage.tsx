import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flame,
  ChevronDown,
  Check,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Plus,
  Link,
  Megaphone,
} from 'lucide-react';
import type { Post as FeedItem } from '../types';
import TagBadge from '../components/TagBadge';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import CreatePostModal from '../components/CreatePostModal';
import NotificationBell from '../components/NotificationBell';
import CommentsSheet from '../components/CommentsSheet';
import { FeedCardSkeleton } from '../components/Skeleton';
import { useFeed } from '../context/FeedContext';
import { sharePost } from '../lib/postShare';
import { getPostById, likePost, savePost, unlikePost, unsavePost } from '../services/feedService';

type FilterValue = 'general' | 'news' | 'clubs' | 'students';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'general', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'clubs', label: 'Club Posts' },
  { value: 'students', label: 'Student Posts' },
];

const FEED_PAGE_LOCK_MS = 520;
const WHEEL_TRIGGER_THRESHOLD = 42;
const SWIPE_TRIGGER_THRESHOLD = 56;

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function getAuthorMeta(item: FeedItem) {
  const isClubPost = item.authorType === 'club';

  return {
    isClubPost,
    displayName: isClubPost ? item.clubName || item.author : item.author,
    displayRole: isClubPost ? 'Club' : item.authorRole,
    avatar: isClubPost ? item.clubAvatar || item.avatar : item.avatar,
  };
}

function getKindAccent(item: FeedItem) {
  if (item.kind === 'announcement') {
    return {
      icon: Megaphone,
      label: 'Announcement',
      textClass: 'text-amber-300',
      bg: 'rgba(245,158,11,0.16)',
      border: '1px solid rgba(245,158,11,0.28)',
    };
  }

  if (item.kind === 'event') {
    return {
      icon: Calendar,
      label: 'Event',
      textClass: 'text-emerald-300',
      bg: 'rgba(34,197,94,0.16)',
      border: '1px solid rgba(34,197,94,0.28)',
    };
  }

  return null;
}

interface InteractionState {
  liked: boolean;
  saved: boolean;
  likes: number;
}

function FilterDropdown({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = FILTERS.find((f) => f.value === value)?.label ?? 'All';

  return (
    <div ref={ref} className="relative z-30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-white transition-all active:scale-95"
        style={{
          background: 'rgba(10,14,26,0.72)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <Flame size={12} className="text-primary-400" />
        {currentLabel}
        <ChevronDown
          size={12}
          className="text-white/50 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-44 rounded-2xl overflow-hidden py-1.5"
          style={{
            background: 'rgba(10,14,26,0.9)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                onChange(f.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-white/6 active:bg-white/10"
              style={{ color: f.value === value ? '#818cf8' : 'rgba(255,255,255,0.6)' }}
            >
              {f.label}
              {f.value === value && <Check size={12} className="text-primary-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailView({
  item,
  state,
  onToggle,
  onClose,
  onOpenComments,
  onShare,
  visible,
}: {
  item: FeedItem;
  state: InteractionState;
  onToggle: (type: 'liked' | 'saved') => void;
  onClose: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  visible: boolean;
}) {
  const touchStartX = useRef(0);
  const authorMeta = getAuthorMeta(item);
  const kindAccent = getKindAccent(item);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 60) onClose();
  };

  const handleOpenRegisterLink = () => {
    if (item.eventDetails?.registerLink) {
      window.open(item.eventDetails.registerLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col transition-transform duration-350 ease-out"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        background: '#0a0e1a',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[260px] flex-shrink-0 overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/30 to-transparent" />

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12">
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-white active:scale-90 transition-all"
            style={{
              background: 'rgba(10,14,26,0.72)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <ArrowLeft size={17} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2">
            {kindAccent && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: kindAccent.bg,
                  border: kindAccent.border,
                }}
              >
                <kindAccent.icon size={10} className={kindAccent.textClass} />
                <span className={`text-[10px] font-bold ${kindAccent.textClass}`}>{kindAccent.label}</span>
              </div>
            )}
            <TagBadge label={item.category} variant={item.categoryTag} />
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="px-5 pt-5 pb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Avatar src={authorMeta.avatar} name={authorMeta.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-none">{authorMeta.displayName}</p>
              <p className="text-[10px] text-white/35 mt-0.5 font-medium">
                {authorMeta.displayRole} - {item.time}
              </p>
            </div>
          </div>

          <h2
            className="text-[22px] font-extrabold text-white leading-tight tracking-tight mb-4"
            style={{ letterSpacing: '-0.025em' }}
          >
            {item.title}
          </h2>

          <div className="flex flex-col gap-4 mb-5">
            {item.fullContent.map((para, i) => (
              <p key={i} className="text-[13px] text-white/60 leading-relaxed font-medium">
                {para}
              </p>
            ))}
          </div>

          {item.kind === 'event' && item.eventDetails && (
            <div
              className="rounded-3xl p-4 mb-5"
              style={{
                background:
                  'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <p className="text-xs font-bold text-primary-400 mb-3 uppercase tracking-wider">
                Event Details
              </p>

              <div className="flex flex-col gap-2.5 mb-4">
                {item.eventDetails.date && (
                  <div className="flex items-center gap-2.5">
                    <Calendar size={13} className="text-primary-400 flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-white/80">{item.eventDetails.date}</span>
                  </div>
                )}
                {item.eventDetails.time && (
                  <div className="flex items-center gap-2.5">
                    <Clock size={13} className="text-primary-400 flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-white/80">{item.eventDetails.time}</span>
                  </div>
                )}
                {item.eventDetails.location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin size={13} className="text-primary-400 flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-white/80">{item.eventDetails.location}</span>
                  </div>
                )}
                {item.eventDetails.seats !== null && item.eventDetails.seats !== undefined && (
                  <div className="flex items-center gap-2.5">
                    <Users size={13} className="text-primary-400 flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-white/80">
                      {item.eventDetails.seats} seats available
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {item.eventDetails?.registerLink && (
            <Button variant="primary" size="md" fullWidth onClick={handleOpenRegisterLink}>
              {item.eventDetails.registerLabel || 'Register Now'}
            </Button>
          )}

          <div
            className="flex items-center gap-1 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <button
              onClick={() => onToggle('liked')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
                state.liked
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Heart size={14} fill={state.liked ? 'currentColor' : 'none'} strokeWidth={2.5} />
              {formatNumber(state.likes)}
            </button>
            <button
              onClick={onOpenComments}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white/35 hover:text-white/60 hover:bg-white/5 transition-all active:scale-95"
            >
              <MessageCircle size={14} strokeWidth={2.5} />
              {item.comments}
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white/35 hover:text-white/60 hover:bg-white/5 transition-all active:scale-95"
            >
              <Share2 size={14} strokeWidth={2.5} />
              Share
            </button>
            <button
              onClick={() => onToggle('saved')}
              className={`ml-auto p-2 rounded-xl transition-all duration-200 active:scale-95 ${
                state.saved
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Bookmark size={14} fill={state.saved ? 'currentColor' : 'none'} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareToast({
  visible,
  message,
  tone,
}: {
  visible: boolean;
  message: string;
  tone: 'success' | 'error';
}) {
  return (
    <div
      className="fixed top-24 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white"
      style={{
        transform: `translateX(-50%) translateY(${visible ? '0' : '-12px'})`,
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        background: tone === 'success' ? 'rgba(16,20,36,0.95)' : 'rgba(64,16,24,0.95)',
        border:
          tone === 'success'
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid rgba(244,63,94,0.28)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }}
    >
      {tone === 'success' ? (
        <Link size={12} className="text-emerald-400" />
      ) : (
        <X size={12} className="text-rose-300" />
      )}
      {message}
    </div>
  );
}

function FeedCard({
  item,
  state,
  onToggle,
  onOpenDetail,
  onOpenComments,
  onShare,
  index,
  total,
  distanceFromActive,
}: {
  item: FeedItem;
  state: InteractionState;
  onToggle: (type: 'liked' | 'saved') => void;
  onOpenDetail: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  index: number;
  total: number;
  distanceFromActive: number;
}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const authorMeta = getAuthorMeta(item);
  const kindAccent = getKindAccent(item);
  const isActive = distanceFromActive === 0;
  const isAhead = distanceFromActive > 0;
  const cardOffsetY = distanceFromActive === 0 ? 0 : isAhead ? 20 : -12;
  const cardScale = distanceFromActive === 0 ? 1 : isAhead ? 0.965 : 0.985;
  const cardOpacity =
    distanceFromActive === 0 ? 1 : Math.abs(distanceFromActive) === 1 ? 0.74 : 0.42;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (deltaX < -60 && deltaY < 50) onOpenDetail();
  };

  return (
    <div
      className="relative flex-shrink-0"
      style={{ height: '100%' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute inset-x-3 top-3 bottom-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: `translateY(${cardOffsetY}px) scale(${cardScale})`,
          opacity: cardOpacity,
          filter: isActive ? 'none' : 'saturate(0.9)',
          willChange: 'transform, opacity',
        }}
      >
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: isActive ? '34px' : '38px',
            boxShadow: isActive
              ? '0 26px 80px rgba(0,0,0,0.42)'
              : '0 14px 40px rgba(0,0,0,0.22)',
            border: `1px solid ${isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <div className="absolute inset-0">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/55 to-[#0a0e1a]/15" />
          </div>

          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'rgba(255,255,255,0.08)', zIndex: 5 }}
          >
            <div
              className="h-full gradient-accent transition-all duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-14 z-10">
            <div className="flex items-center gap-2">
              <TagBadge label={item.category} variant={item.categoryTag} dot />
              {kindAccent && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{
                    background: kindAccent.bg,
                    border: kindAccent.border,
                  }}
                >
                  <kindAccent.icon size={9} className={kindAccent.textClass} />
                  <span className={`text-[9px] font-bold ${kindAccent.textClass}`}>{kindAccent.label}</span>
                </div>
              )}
            </div>

            {state.likes > 500 && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(245,158,11,0.18)',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
              >
                <Flame size={9} className="text-amber-400" />
                <span className="text-[9px] font-bold text-amber-300">Trending</span>
              </div>
            )}
          </div>

          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20"
            style={{ pointerEvents: 'auto' }}
          >
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggle('liked');
              }}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                state.liked
                  ? 'text-rose-400 bg-rose-500/15 shadow-[0_10px_24px_rgba(244,63,94,0.22)]'
                  : 'text-white/60 bg-black/30 hover:bg-black/50'
              }`}
              style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Heart size={18} fill={state.liked ? 'currentColor' : 'none'} strokeWidth={2} />
              <span className="text-[9px] font-bold">{formatNumber(state.likes)}</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments();
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl text-white/60 bg-black/30 hover:bg-black/50 transition-all active:scale-90"
              style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <MessageCircle size={18} strokeWidth={2} />
              <span className="text-[9px] font-bold">{item.comments}</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggle('saved');
              }}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                state.saved
                  ? 'text-primary-400 bg-primary-500/15'
                  : 'text-white/60 bg-black/30 hover:bg-black/50'
              }`}
              style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Bookmark size={18} fill={state.saved ? 'currentColor' : 'none'} strokeWidth={2} />
              <span className="text-[9px] font-bold">Save</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl text-white/60 bg-black/30 hover:bg-black/50 transition-all active:scale-90"
              style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Share2 size={18} strokeWidth={2} />
              <span className="text-[9px] font-bold">Share</span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-5 pb-28 z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <Avatar src={authorMeta.avatar} name={authorMeta.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-none">{authorMeta.displayName}</p>
                <p className="text-[10px] text-white/45 mt-0.5">
                  {authorMeta.displayRole} - {item.time}
                </p>
              </div>
            </div>

            <h2
              className="text-[22px] font-extrabold text-white leading-tight mb-2 pr-14"
              style={{ letterSpacing: '-0.025em', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              {item.title}
            </h2>

            <p className="text-[13px] text-white/60 leading-relaxed pr-16 line-clamp-2 font-medium mb-4">
              {item.summary}
            </p>

            <button
              onClick={onOpenDetail}
              className="flex items-center gap-2 text-xs font-bold text-primary-400 active:scale-95 transition-transform"
            >
              <span>Read more</span>
              <div
                className="px-2 py-0.5 rounded-lg text-[10px]"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                swipe left
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage({
  onOpenNotifications,
  sharedPostId,
  onSharedPostClose,
}: {
  onOpenNotifications?: () => void;
  sharedPostId?: number;
  onSharedPostClose?: () => void;
}) {
  const { items: allItems, refreshFeed, isLoading } = useFeed();
  const [filter, setFilter] = useState<FilterValue>('general');
  const [interactions, setInteractions] = useState<Record<number, InteractionState>>({});
  const [detailItem, setDetailItem] = useState<FeedItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [commentsItem, setCommentsItem] = useState<FeedItem | null>(null);
  const [shareFeedback, setShareFeedback] = useState<{
    visible: boolean;
    message: string;
    tone: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    tone: 'success',
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const pagingLockedRef = useRef(false);
  const wheelDeltaRef = useRef(0);
  const lastWheelTsRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const touchLockedRef = useRef(false);
  const sharedPostHandledRef = useRef<number | null>(null);
  const shareToastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (filter === 'general') {
      refreshFeed();
    } else {
      refreshFeed(filter);
    }
  }, [filter, refreshFeed]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  const getInteraction = useCallback(
    (item: FeedItem): InteractionState => {
      return interactions[item.id] ?? { liked: item.liked, saved: item.saved, likes: item.likes };
    },
    [interactions]
  );

  const displayedItems = allItems;

  useEffect(() => {
    if (displayedItems.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => Math.min(current, displayedItems.length - 1));
  }, [displayedItems.length]);

  useEffect(() => {
    return () => {
      if (shareToastTimeoutRef.current) {
        window.clearTimeout(shareToastTimeoutRef.current);
      }
    };
  }, []);

  const pageToIndex = useCallback(
    (nextIndex: number) => {
      if (displayedItems.length === 0) return;

      const boundedIndex = Math.max(0, Math.min(nextIndex, displayedItems.length - 1));
      if (boundedIndex === activeIndex) return;

      pagingLockedRef.current = true;
      setActiveIndex(boundedIndex);

      window.setTimeout(() => {
        pagingLockedRef.current = false;
      }, FEED_PAGE_LOCK_MS);
    },
    [activeIndex, displayedItems.length]
  );

  const pageBy = useCallback(
    (delta: -1 | 1) => {
      pageToIndex(activeIndex + delta);
    },
    [activeIndex, pageToIndex]
  );

  const handleWheelNavigation = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (detailItem || commentsItem || createOpen || displayedItems.length <= 1) {
        return;
      }

      event.preventDefault();

      if (pagingLockedRef.current) {
        return;
      }

      const now = Date.now();
      if (now - lastWheelTsRef.current > 180) {
        wheelDeltaRef.current = 0;
      }

      lastWheelTsRef.current = now;
      wheelDeltaRef.current += event.deltaY;

      if (Math.abs(wheelDeltaRef.current) < WHEEL_TRIGGER_THRESHOLD) {
        return;
      }

      const direction = wheelDeltaRef.current > 0 ? 1 : -1;
      wheelDeltaRef.current = 0;
      pageBy(direction as -1 | 1);
    },
    [commentsItem, createOpen, detailItem, displayedItems.length, pageBy]
  );

  const handleFeedTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (detailItem || commentsItem || createOpen) {
        return;
      }

      const touch = event.touches[0];
      touchStartYRef.current = touch.clientY;
      touchStartXRef.current = touch.clientX;
      touchLockedRef.current = false;
    },
    [commentsItem, createOpen, detailItem]
  );

  const handleFeedTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (
        detailItem ||
        commentsItem ||
        createOpen ||
        pagingLockedRef.current ||
        touchLockedRef.current ||
        displayedItems.length <= 1
      ) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaY = touch.clientY - touchStartYRef.current;
      const deltaX = touch.clientX - touchStartXRef.current;

      if (Math.abs(deltaY) < SWIPE_TRIGGER_THRESHOLD || Math.abs(deltaY) <= Math.abs(deltaX)) {
        return;
      }

      pageBy(deltaY < 0 ? 1 : -1);
      touchLockedRef.current = true;
    },
    [commentsItem, createOpen, detailItem, displayedItems.length, pageBy]
  );

  const toggle = useCallback(async (id: number, type: 'liked' | 'saved', currentState: InteractionState) => {
    const nextState: InteractionState = {
      ...currentState,
      [type]: !currentState[type],
      likes:
        type === 'liked'
          ? currentState.likes + (currentState.liked ? -1 : 1)
          : currentState.likes,
    };

    setInteractions((prev) => ({
      ...prev,
      [id]: nextState,
    }));

    const result =
      type === 'liked'
        ? currentState.liked
          ? await unlikePost(id)
          : await likePost(id)
        : currentState.saved
        ? await unsavePost(id)
        : await savePost(id);

    if (result.error) {
      console.error(`Failed to toggle ${type}:`, result.error);
      setInteractions((prev) => ({
        ...prev,
        [id]: currentState,
      }));
    }
  }, []);

  const openDetail = useCallback((item: FeedItem) => {
    setDetailItem(item);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDetailVisible(true);
      });
    });
  }, []);

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
    setTimeout(() => {
      setDetailItem(null);
      if (sharedPostId && onSharedPostClose) {
        onSharedPostClose();
      }
    }, 360);
  }, [onSharedPostClose, sharedPostId]);

  const showShareFeedback = useCallback((message: string, tone: 'success' | 'error') => {
    if (shareToastTimeoutRef.current) {
      window.clearTimeout(shareToastTimeoutRef.current);
    }

    setShareFeedback({
      visible: true,
      message,
      tone,
    });

    shareToastTimeoutRef.current = window.setTimeout(() => {
      setShareFeedback((current) => ({ ...current, visible: false }));
    }, 2200);
  }, []);

  const handleShare = useCallback(
    async (item: FeedItem) => {
      const result = await sharePost(item);

      if (result.success) {
        showShareFeedback(
          result.mode === 'native-share' ? 'Post shared successfully' : 'Post link copied',
          'success'
        );
        return;
      }

      if (result.cancelled) {
        return;
      }

      showShareFeedback(result.error || 'Unable to share this post right now.', 'error');
    },
    [showShareFeedback]
  );

  useEffect(() => {
    if (!sharedPostId) {
      sharedPostHandledRef.current = null;
      return;
    }

    if (sharedPostHandledRef.current === sharedPostId) {
      return;
    }

    const matchingIndex = displayedItems.findIndex((item) => item.id === sharedPostId);
    if (matchingIndex >= 0) {
      sharedPostHandledRef.current = sharedPostId;
      setActiveIndex(matchingIndex);
      openDetail(displayedItems[matchingIndex]);
      return;
    }

    let cancelled = false;

    const loadSharedPost = async () => {
      const post = await getPostById(sharedPostId);
      if (cancelled) {
        return;
      }

      if (!post) {
        sharedPostHandledRef.current = sharedPostId;
        showShareFeedback('Shared post not found or unavailable.', 'error');
        return;
      }

      sharedPostHandledRef.current = sharedPostId;
      openDetail(post);
    };

    void loadSharedPost();

    return () => {
      cancelled = true;
    };
  }, [displayedItems, openDetail, sharedPostId, showShareFeedback]);

  const handleCloseCreateModal = async () => {
    setCreateOpen(false);
    if (filter === 'general') {
      await refreshFeed();
    } else {
      await refreshFeed(filter);
    }
  };

  if (isLoading) {
    return (
      <div className="relative mx-auto w-full lg:max-w-[620px]" style={{ height: '100dvh', overflow: 'hidden' }}>
        <FeedCardSkeleton />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full lg:max-w-[620px]" style={{ height: '100dvh', overflow: 'hidden' }}>
      <ShareToast
        visible={shareFeedback.visible}
        message={shareFeedback.message}
        tone={shareFeedback.tone}
      />

      <div
        onWheel={handleWheelNavigation}
        onTouchStart={handleFeedTouchStart}
        onTouchEnd={handleFeedTouchEnd}
        style={{
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'pan-x pinch-zoom',
          background:
            'radial-gradient(circle at top center, rgba(99,102,241,0.16) 0%, rgba(10,14,26,0.98) 36%, #070b15 100%)',
        }}
      >
        {displayedItems.length > 0 && (
          <>
            <div
              className="pointer-events-none absolute inset-x-6 top-5 h-8 rounded-[28px]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
                transform: 'translateY(18px) scale(0.965)',
                filter: 'blur(1px)',
              }}
            />

            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transform: `translate3d(0, -${activeIndex * 100}%, 0)`,
                transition: 'transform 540ms cubic-bezier(0.22,1,0.36,1)',
                willChange: 'transform',
              }}
            >
              {displayedItems.map((item, index) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  state={getInteraction(item)}
                  onToggle={(type) => toggle(item.id, type, getInteraction(item))}
                  onOpenDetail={() => openDetail(item)}
                  onOpenComments={() => setCommentsItem(item)}
                  onShare={() => {
                    void handleShare(item);
                  }}
                  index={index}
                  total={displayedItems.length}
                  distanceFromActive={index - activeIndex}
                />
              ))}
            </div>
          </>
        )}

        {displayedItems.length === 0 && (
          <div className="flex items-center justify-center" style={{ height: '100dvh' }}>
            <div className="text-center px-8">
              <div className="w-16 h-16 glass-strong rounded-3xl flex items-center justify-center mx-auto mb-4">
                <X size={24} className="text-white/25" />
              </div>
              <p className="text-base font-bold text-white mb-1">Nothing here yet</p>
              <p className="text-sm text-white/40">
                {filter === 'general' ? 'Create the first post' : 'Try a different filter'}
              </p>
            </div>
          </div>
        )}

        {displayedItems.length > 1 && (
          <div className="pointer-events-none absolute right-4 bottom-[98px] z-20 flex flex-col items-center gap-2">
            {displayedItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  width: index === activeIndex ? 8 : 6,
                  height: index === activeIndex ? 22 : 6,
                  borderRadius: 999,
                  background:
                    index === activeIndex
                      ? 'linear-gradient(180deg, rgba(129,140,248,1) 0%, rgba(167,139,250,0.92) 100%)'
                      : 'rgba(255,255,255,0.22)',
                  transition: 'all 220ms ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute top-12 left-4 z-20" style={{ pointerEvents: 'auto' }}>
        <FilterDropdown value={filter} onChange={setFilter} />
      </div>

      {onOpenNotifications && (
        <div className="absolute top-12 right-4 z-20" style={{ pointerEvents: 'auto' }}>
          <NotificationBell onClick={onOpenNotifications} />
        </div>
      )}

      <button
        onClick={() => setCreateOpen(true)}
        className="absolute z-30 flex items-center justify-center w-14 h-14 rounded-full transition-all active:scale-90"
        style={{
          bottom: '88px',
          right: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 6px 24px rgba(99,102,241,0.55), 0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <Plus size={22} className="text-white" strokeWidth={2.5} />
      </button>

      {detailItem && (
        <DetailView
          item={detailItem}
          state={getInteraction(detailItem)}
          onToggle={(type) => toggle(detailItem.id, type, getInteraction(detailItem))}
          onClose={closeDetail}
          onOpenComments={() => setCommentsItem(detailItem)}
          onShare={() => {
            void handleShare(detailItem);
          }}
          visible={detailVisible}
        />
      )}

      <CreatePostModal isOpen={createOpen} onClose={handleCloseCreateModal} />

      {commentsItem && (
        <CommentsSheet
          postId={commentsItem.id}
          postTitle={commentsItem.title}
          totalComments={commentsItem.comments}
          onClose={() => setCommentsItem(null)}
        />
      )}
    </div>
  );
}
