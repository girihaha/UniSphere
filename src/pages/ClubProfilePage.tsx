import { useState } from 'react';
import {
  ArrowLeft, Heart, MessageCircle, Bookmark,
  Users, Calendar, Tag, Share2, MoreHorizontal, Link,
} from 'lucide-react';
import { Club } from '../data/clubs';
import Button from '../components/Button';
import TagBadge from '../components/TagBadge';
import CommentsSheet from '../components/CommentsSheet';

interface ClubProfilePageProps {
  club: Club;
  followed: boolean;
  onToggleFollow: () => void;
  onBack: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ClubProfilePage({
  club,
  followed,
  onToggleFollow,
  onBack,
}: ClubProfilePageProps) {
  const [postStates, setPostStates] = useState<Record<number, { liked: boolean; saved: boolean; likes: number }>>(
    () => Object.fromEntries(club.posts.map((p) => [p.id, { liked: false, saved: false, likes: p.likes }]))
  );
  const [commentsPostId, setCommentsPostId] = useState<number | null>(null);
  const [shareToast, setShareToast] = useState(false);

  const togglePost = (id: number, type: 'liked' | 'saved') => {
    setPostStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: !prev[id][type],
        likes: type === 'liked' ? prev[id].likes + (prev[id].liked ? -1 : 1) : prev[id].likes,
      },
    }));
  };

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2200);
  };

  const commentsPost = commentsPostId !== null
    ? club.posts.find((p) => p.id === commentsPostId)
    : null;

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
          <img
            src={club.heroImage}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${club.color} opacity-60 mix-blend-multiply`} />
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
                  <TagBadge label={club.category} variant={club.categoryTag} />
                </div>
                <h1
                  className="text-[26px] font-extrabold text-white leading-tight tracking-tight drop-shadow-lg"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                >
                  {club.name}
                </h1>
                <p className="text-sm text-white/65 font-medium mt-0.5 italic">{club.tagline}</p>
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
              { icon: Users,    label: 'Members',  value: club.members },
              { icon: Calendar, label: 'Founded',  value: club.founded },
              { icon: Tag,      label: 'Type',     value: club.type.split(' ')[0] },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl px-3 py-3 text-center"
                style={{ border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <stat.icon size={14} className="text-primary-400 mx-auto mb-1.5" />
                <p className="text-[13px] font-extrabold text-white leading-none">{stat.value}</p>
                <p className="text-[9px] text-white/35 font-semibold mt-0.5 uppercase tracking-wide">{stat.label}</p>
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
            <p className="text-[13px] text-white/60 leading-relaxed font-medium">{club.description}</p>

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
              <span className="ml-auto text-[11px] text-white/25 font-medium">Est. {club.founded}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full gradient-accent" />
              <span className="text-sm font-bold text-white tracking-tight">Club Posts</span>
              <span className="ml-auto glass px-2.5 py-1 rounded-xl text-[11px] font-semibold text-white/35">
                {club.posts.length}
              </span>
            </div>

            {club.posts.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <MessageCircle size={22} className="text-white/20" />
                </div>
                <p className="text-sm font-bold text-white/35">No posts yet</p>
                <p className="text-xs text-white/20 mt-1">This club hasn't posted anything</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-2">
                {club.posts.map((post) => {
                  const state = postStates[post.id];
                  if (!state) return null;
                  return (
                    <div
                      key={post.id}
                      className="glass-card rounded-3xl overflow-hidden card-hover shadow-glass"
                      style={{ border: '1px solid rgba(255,255,255,0.09)' }}
                    >
                      <div className="relative">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-[160px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/20 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <TagBadge label={club.category} variant={club.categoryTag} size="sm" dot />
                        </div>
                      </div>

                      <div className="p-4 pt-3">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div
                            className={`w-7 h-7 rounded-full bg-gradient-to-br ${club.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <span className="text-white text-[10px] font-bold">{club.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-none">{club.name}</p>
                            <p className="text-[10px] text-white/35 mt-0.5">{post.time}</p>
                          </div>
                        </div>

                        <h3 className="font-bold text-white text-[14px] leading-snug mb-1.5 tracking-tight">
                          {post.title}
                        </h3>
                        <p className="text-[12px] text-white/48 leading-relaxed line-clamp-2">{post.summary}</p>

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
