import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Users,
  Calendar,
  Tag,
  Share2,
  MoreHorizontal,
  Link,
  Megaphone,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { Club, Post } from '../types';
import Button from '../components/Button';
import TagBadge from '../components/TagBadge';
import CommentsSheet from '../components/CommentsSheet';
import Avatar from '../components/Avatar';
import { getClubById } from '../services/clubService';
import { savePost, unsavePost } from '../services/feedService';

interface ClubProfilePageProps {
  club: any;
  followed: boolean;
  onToggleFollow: () => void;
  onBack: () => void;
}

type ClubTab = 'posts' | 'highlights';

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function normalizeClub(rawClub: any): any {
  const categoryTag =
    rawClub.category === 'Technology'
      ? 'blue'
      : rawClub.category === 'Design'
      ? 'violet'
      : rawClub.category === 'Entrepreneurship'
      ? 'emerald'
      : 'blue';

  const color =
    rawClub.category === 'Technology'
      ? 'from-indigo-500 to-violet-500'
      : rawClub.category === 'Design'
      ? 'from-pink-500 to-rose-500'
      : rawClub.category === 'Entrepreneurship'
      ? 'from-emerald-500 to-teal-500'
      : 'from-slate-500 to-slate-700';

  return {
    ...rawClub,
    heroImage: rawClub.coverImage || rawClub.heroImage || rawClub.avatar || '',
    categoryTag,
    color,
    tagline: rawClub.username || rawClub.tagline || rawClub.description || '',
    founded: rawClub.founded || '2024',
    type: rawClub.type || rawClub.category || 'Club',
    logoImage: rawClub.logoImage || rawClub.avatar || '',
    posts: rawClub.posts || [],
  };
}

function normalizeClubPost(rawPost: any, clubData: any): Post {
  const content = rawPost.content || rawPost.summary || '';
  const summary =
    rawPost.summary ||
    (content.length > 120 ? `${content.slice(0, 120)}...` : content || 'No description available.');

  const kind = rawPost.kind || (rawPost.eventDetails ? 'event' : 'post');
  const isClubAuthored = rawPost.authorType === 'club' || !!rawPost.clubId || true;

  const category =
    kind === 'announcement'
      ? 'Announcement'
      : kind === 'event'
      ? 'Event'
      : rawPost.category || 'Club Update';

  const categoryTag =
    kind === 'announcement'
      ? 'amber'
      : kind === 'event'
      ? 'emerald'
      : rawPost.categoryTag || clubData.categoryTag || 'violet';

  return {
    id: Number(rawPost.id),
    type: rawPost.type || 'clubs',
    kind,
    authorType: isClubAuthored ? 'club' : 'user',
    author: rawPost.author || rawPost.clubName || clubData.name,
    authorId: rawPost.authorId,
    authorRole: rawPost.authorRole || 'Club',
    avatar: rawPost.clubAvatar || rawPost.avatar || clubData.avatar || clubData.logoImage || '',
    authorName: rawPost.authorName || rawPost.clubName || clubData.name,
    userAvatar: rawPost.userAvatar,
    clubName: rawPost.clubName || clubData.name,
    clubAvatar: rawPost.clubAvatar || clubData.avatar || clubData.logoImage || '',
    time: rawPost.time || 'Just now',
    category,
    categoryTag,
    title: rawPost.title || 'Untitled Post',
    summary,
    fullContent:
      Array.isArray(rawPost.fullContent) && rawPost.fullContent.length > 0
        ? rawPost.fullContent
        : [content || 'No additional content available.'],
    content,
    image:
      rawPost.image ||
      clubData.heroImage ||
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    eventDetails: rawPost.eventDetails || null,
    likes: typeof rawPost.likes === 'number' ? rawPost.likes : 0,
    comments: typeof rawPost.comments === 'number' ? rawPost.comments : 0,
    saved: typeof rawPost.saved === 'boolean' ? rawPost.saved : false,
    liked: typeof rawPost.liked === 'boolean' ? rawPost.liked : false,
    clubId: rawPost.clubId || clubData.id,
    status: rawPost.status,
    submittedAt: rawPost.submittedAt,
    clubReviewedBy: rawPost.clubReviewedBy,
    clubReviewedAt: rawPost.clubReviewedAt,
    adminReviewedBy: rawPost.adminReviewedBy,
    adminReviewedAt: rawPost.adminReviewedAt,
    rejectionReason: rawPost.rejectionReason,
  };
}

function getKindAccent(post: Post) {
  if (post.kind === 'announcement') {
    return {
      icon: Megaphone,
      label: 'Announcement',
      textClass: 'text-amber-300',
      bg: 'rgba(245,158,11,0.16)',
      border: '1px solid rgba(245,158,11,0.28)',
    };
  }

  if (post.kind === 'event') {
    return {
      icon: Calendar,
      label: 'Event',
      textClass: 'text-emerald-300',
      bg: 'rgba(34,197,94,0.16)',
      border: '1px solid rgba(34,197,94,0.28)',
    };
  }

  return {
    icon: FileText,
    label: 'Post',
    textClass: 'text-violet-300',
    bg: 'rgba(139,92,246,0.16)',
    border: '1px solid rgba(139,92,246,0.28)',
  };
}

export default function ClubProfilePage({
  club,
  followed,
  onToggleFollow,
  onBack,
}: ClubProfilePageProps) {
  const [clubData, setClubData] = useState<any>(normalizeClub(club));
  const [postStates, setPostStates] = useState<Record<number, { liked: boolean; saved: boolean; likes: number }>>(
    () =>
      Object.fromEntries(
        (normalizeClub(club).posts || []).map((p: any) => [
          p.id,
          {
            liked: !!p.liked,
            saved: !!p.saved,
            likes: typeof p.likes === 'number' ? p.likes : 0,
          },
        ])
      )
  );
  const [commentsPostId, setCommentsPostId] = useState<number | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [activeTab, setActiveTab] = useState<ClubTab>('posts');

  useEffect(() => {
    const loadClub = async () => {
      try {
        const fresh = await getClubById(club.id);
        if (fresh) {
          const normalized = normalizeClub(fresh);
          setClubData(normalized);
          setPostStates(
            Object.fromEntries(
              (normalized.posts || []).map((p: any) => [
                p.id,
                {
                  liked: !!p.liked,
                  saved: !!p.saved,
                  likes: typeof p.likes === 'number' ? p.likes : 0,
                },
              ])
            )
          );
        } else {
          setClubData(normalizeClub(club));
        }
      } catch (error) {
        console.error('Failed to load club detail:', error);
        setClubData(normalizeClub(club));
      }
    };

    loadClub();
  }, [club]);

  const normalizedPosts = useMemo<Post[]>(() => {
    return (clubData.posts || []).map((post: any) => normalizeClubPost(post, clubData));
  }, [clubData]);

  const regularPosts = useMemo(
    () => normalizedPosts.filter((post) => post.kind !== 'announcement' && post.kind !== 'event'),
    [normalizedPosts]
  );

  const highlights = useMemo(
    () => normalizedPosts.filter((post) => post.kind === 'announcement' || post.kind === 'event'),
    [normalizedPosts]
  );

  const visiblePosts = activeTab === 'posts' ? regularPosts : highlights;

  const togglePost = async (id: number, type: 'liked' | 'saved') => {
    const current = postStates[id] || { liked: false, saved: false, likes: 0 };
    const next = {
      ...current,
      [type]: !current[type],
      likes:
        type === 'liked'
          ? current.likes + (current.liked ? -1 : 1)
          : current.likes,
    };

    setPostStates((prev) => ({
      ...prev,
      [id]: next,
    }));

    if (type !== 'saved') {
      return;
    }

    const result = current.saved ? await unsavePost(id) : await savePost(id);

    if (result.error) {
      console.error('Failed to toggle saved post:', result.error);
      setPostStates((prev) => ({
        ...prev,
        [id]: current,
      }));
    }
  };

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2200);
  };

  const commentsPost =
    commentsPostId !== null ? normalizedPosts.find((p) => p.id === commentsPostId) : null;

  return (
    <div className="content-area fade-in">
      {shareToast && (
        <div
          className="fixed top-24 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white"
          style={{
            transform: 'translateX(-50%)',
            background: 'rgba(16,20,36,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.25s ease forwards',
          }}
        >
          <Link size={12} className="text-emerald-400" />
          Link copied to clipboard
        </div>
      )}

      <div className="relative">
        <div className="relative h-[260px] overflow-hidden">
          {clubData.heroImage && (
            <img src={clubData.heroImage} alt={clubData.name} className="w-full h-full object-cover" />
          )}
          <div className={`absolute inset-0 bg-gradient-to-br ${clubData.color} opacity-60 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/40 to-transparent" />

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-3">
            <button
              onClick={onBack}
              className="glass-dark p-2.5 rounded-2xl text-white active:scale-90 transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <ArrowLeft size={17} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleShare}
              className="glass-dark p-2.5 rounded-2xl text-white/60 hover:text-white transition-colors active:scale-90"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <MoreHorizontal size={17} />
            </button>
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <TagBadge label={clubData.category} variant={clubData.categoryTag} />
                </div>
                <h1
                  className="text-[26px] font-extrabold text-white leading-tight tracking-tight drop-shadow-lg"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                >
                  {clubData.name}
                </h1>
                <p className="text-sm text-white/65 font-medium mt-0.5 italic">{clubData.tagline}</p>
              </div>

              <Button
                variant={followed ? 'secondary' : 'primary'}
                size="md"
                onClick={onToggleFollow}
                className="flex-shrink-0 !px-5"
              >
                {followed ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: Users, label: 'Members', value: clubData.members },
              { icon: Calendar, label: 'Founded', value: clubData.founded },
              { icon: Tag, label: 'Type', value: String(clubData.type).split(' ')[0] },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl px-3 py-3 text-center"
                style={{ border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <stat.icon size={14} className="text-primary-400 mx-auto mb-1.5" />
                <p className="text-[13px] font-extrabold text-white leading-none">{stat.value}</p>
                <p className="text-[9px] text-white/35 font-semibold mt-0.5 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-3xl p-4 mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1 h-4 rounded-full gradient-accent" />
              <span className="text-sm font-bold text-white tracking-tight">About</span>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed font-medium">{clubData.description}</p>

            <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-white/7">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors active:scale-95"
              >
                <Share2 size={13} />
                Share Club
              </button>
              <div className="w-px h-3.5 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400">Active</span>
              </div>
              <span className="ml-auto text-[11px] text-white/25 font-medium">Est. {clubData.founded}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full gradient-accent" />
              <span className="text-sm font-bold text-white tracking-tight">Club Content</span>
              <span className="ml-auto glass px-2.5 py-1 rounded-xl text-[11px] font-semibold text-white/35">
                {normalizedPosts.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setActiveTab('posts')}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.98]"
                style={{
                  background: activeTab === 'posts' ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${
                    activeTab === 'posts' ? 'rgba(99,102,241,0.34)' : 'rgba(255,255,255,0.08)'
                  }`,
                  color: activeTab === 'posts' ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                }}
              >
                <FileText size={14} />
                Posts
                <span className="text-[10px] opacity-70">{regularPosts.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('highlights')}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.98]"
                style={{
                  background: activeTab === 'highlights' ? 'rgba(245,158,11,0.16)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${
                    activeTab === 'highlights' ? 'rgba(245,158,11,0.30)' : 'rgba(255,255,255,0.08)'
                  }`,
                  color: activeTab === 'highlights' ? '#fcd34d' : 'rgba(255,255,255,0.45)',
                }}
              >
                <Sparkles size={14} />
                Announcements & Events
                <span className="text-[10px] opacity-70">{highlights.length}</span>
              </button>
            </div>

            {visiblePosts.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <MessageCircle size={22} className="text-white/20" />
                </div>
                <p className="text-sm font-bold text-white/35">
                  {activeTab === 'posts' ? 'No posts yet' : 'No announcements or events yet'}
                </p>
                <p className="text-xs text-white/20 mt-1">
                  {activeTab === 'posts'
                    ? "This club hasn't published any regular posts"
                    : "This club hasn't published any announcements or events"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-2">
                {visiblePosts.map((post) => {
                  const state = postStates[post.id] || {
                    liked: post.liked,
                    saved: post.saved,
                    likes: post.likes,
                  };

                  const kindAccent = getKindAccent(post);

                  return (
                    <div
                      key={post.id}
                      className="glass-card rounded-3xl overflow-hidden card-hover shadow-glass"
                      style={{ border: '1px solid rgba(255,255,255,0.09)' }}
                    >
                      <div className="relative">
                        {post.image && (
                          <img src={post.image} alt={post.title} className="w-full h-[160px] object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/20 to-transparent" />

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <TagBadge label={post.category} variant={post.categoryTag} size="sm" dot />
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-full"
                            style={{
                              background: kindAccent.bg,
                              border: kindAccent.border,
                            }}
                          >
                            <kindAccent.icon size={9} className={kindAccent.textClass} />
                            <span className={`text-[9px] font-bold ${kindAccent.textClass}`}>
                              {kindAccent.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-3">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <Avatar
                            src={post.clubAvatar || post.avatar}
                            name={post.clubName || clubData.name}
                            size="sm"
                          />
                          <div>
                            <p className="text-xs font-bold text-white leading-none">
                              {post.clubName || clubData.name}
                            </p>
                            <p className="text-[10px] text-white/35 mt-0.5">{post.time}</p>
                          </div>
                        </div>

                        <h3 className="font-bold text-white text-[14px] leading-snug mb-1.5 tracking-tight">
                          {post.title}
                        </h3>
                        <p className="text-[12px] text-white/48 leading-relaxed line-clamp-2">
                          {post.summary || post.content}
                        </p>

                        {post.kind === 'event' && post.eventDetails && (
                          <div
                            className="mt-3 rounded-2xl px-3 py-2.5"
                            style={{
                              background: 'rgba(99,102,241,0.08)',
                              border: '1px solid rgba(99,102,241,0.16)',
                            }}
                          >
                            {post.eventDetails.date && (
                              <p className="text-[11px] text-white/70 font-medium">
                                {post.eventDetails.date}
                              </p>
                            )}
                            {post.eventDetails.time && (
                              <p className="text-[11px] text-white/45 mt-0.5">
                                {post.eventDetails.time}
                              </p>
                            )}
                            {post.eventDetails.location && (
                              <p className="text-[11px] text-white/45 mt-0.5">
                                {post.eventDetails.location}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-3.5 pt-3 border-t border-white/7">
                          <button
                            onClick={() => togglePost(post.id, 'liked')}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                              state.liked
                                ? 'text-rose-400 bg-rose-500/10'
                                : 'text-white/35 hover:text-white/60 hover:bg-white/5'
                            }`}
                          >
                            <Heart size={13} fill={state.liked ? 'currentColor' : 'none'} strokeWidth={2.5} />
                            {formatNumber(state.likes)}
                          </button>

                          <button
                            onClick={() => setCommentsPostId(post.id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white/35 hover:text-white/60 hover:bg-white/5 transition-all active:scale-95"
                          >
                            <MessageCircle size={13} strokeWidth={2.5} />
                            {post.comments}
                          </button>

                          <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white/35 hover:text-white/60 hover:bg-white/5 transition-all active:scale-95"
                          >
                            <Share2 size={13} strokeWidth={2.5} />
                          </button>

                          <button
                            onClick={() => togglePost(post.id, 'saved')}
                            className={`ml-auto p-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                              state.saved
                                ? 'text-primary-400 bg-primary-500/10'
                                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                            }`}
                          >
                            <Bookmark size={13} fill={state.saved ? 'currentColor' : 'none'} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {commentsPost && (
        <CommentsSheet
          postId={commentsPost.id}
          postTitle={commentsPost.title}
          totalComments={commentsPost.comments}
          onClose={() => setCommentsPostId(null)}
        />
      )}
    </div>
  );
}
