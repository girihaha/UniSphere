import { useMemo, useState } from 'react';
import {
  File as FileEdit,
  ChevronRight,
  Calendar,
  MapPin,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useModeration } from '../context/ModerationContext';
import { ModerationItem as PendingPost } from '../types';
import StatusBadge from '../components/StatusBadge';
import TagBadge from '../components/TagBadge';

function PostDetailSheet({
  post,
  onClose,
  onDelete,
  isDeleting,
}: {
  post: PendingPost;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const item = post.post;
  const handleOpenCta = () => {
    if (item.eventDetails?.registerLink) {
      window.open(item.eventDetails.registerLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(10,14,26,0.98)', backdropFilter: 'blur(16px)' }}
    >
      <div className="mx-auto max-w-[430px] pb-16">
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-12 pb-4"
          style={{
            background: 'rgba(10,14,26,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <ArrowLeft size={17} />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-white truncate">{item.title}</h2>
            <p className="text-[10px] text-white/35">Submitted {post.submittedAt}</p>
          </div>

          <StatusBadge status={post.status} size="sm" />
        </div>

        <div className="px-4 pt-4">
          {item.image && (
            <div className="rounded-3xl overflow-hidden h-48 mb-4">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <TagBadge label={item.category} variant={item.categoryTag} dot size="sm" />
          </div>

          <h1 className="text-xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.025em' }}>
            {item.title}
          </h1>

          <p className="text-sm text-white/50 leading-relaxed mb-4">{item.summary}</p>

          {item.fullContent.map((para, i) => (
            <p key={i} className="text-[13px] text-white/55 leading-relaxed mb-3">
              {para}
            </p>
          ))}

          {item.eventDetails && (
            <div
              className="rounded-2xl p-4 mb-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-3">
                {item.kind === 'event' ? 'Event Details' : 'Action'}
              </p>

              <div className="flex flex-col gap-2 text-[12px] text-white/50">
                {item.eventDetails.date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={11} className="text-white/25" />
                    {item.eventDetails.date}
                  </div>
                )}
                {item.eventDetails.time && (
                  <div className="flex items-center gap-2">
                    <Clock size={11} className="text-white/25" />
                    {item.eventDetails.time}
                  </div>
                )}
                {item.eventDetails.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={11} className="text-white/25" />
                    {item.eventDetails.location}
                  </div>
                )}
              </div>

              {item.eventDetails.registerLink && (
                <button
                  type="button"
                  onClick={handleOpenCta}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 6px 18px rgba(99,102,241,0.28)',
                  }}
                >
                  {item.eventDetails.registerLabel || 'Register Now'}
                </button>
              )}
            </div>
          )}

          {post.status === 'pending_club_review' && (
            <div
              className="flex gap-2.5 rounded-2xl p-4"
              style={{
                background: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.18)',
              }}
            >
              <Clock size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-amber-300 mb-0.5">Waiting for Club Review</p>
                <p className="text-[11px] text-amber-300/60">
                  Your post has been submitted successfully and is waiting for club admin approval.
                </p>
              </div>
            </div>
          )}

          {post.status === 'pending_admin_review' && (
            <div
              className="flex gap-2.5 rounded-2xl p-4"
              style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.18)',
              }}
            >
              <ShieldCheck size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-primary-300 mb-0.5">Waiting for Admin Review</p>
                <p className="text-[11px] text-primary-200/60">
                  Your post passed the first stage and is now waiting for final super admin approval.
                </p>
              </div>
            </div>
          )}

          {post.status === 'approved' && (
            <div
              className="flex gap-2.5 rounded-2xl p-4"
              style={{
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.18)',
              }}
            >
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-emerald-300 mb-0.5">Post Approved</p>
                <p className="text-[11px] text-emerald-300/60">
                  Your post has been approved and is now live in the public feed.
                </p>
              </div>
            </div>
          )}

          {post.status === 'rejected' && (
            <div
              className="flex gap-2.5 rounded-2xl p-4"
              style={{
                background: 'rgba(244,63,94,0.06)',
                border: '1px solid rgba(244,63,94,0.18)',
              }}
            >
              <XCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-rose-300 mb-0.5">Post Rejected</p>
                <p className="text-[11px] text-rose-300/60">
                  {post.rejectionReason || 'Your post did not pass the approval review.'}
                </p>
              </div>
            </div>
          )}

          {post.rejectionReason && post.status === 'rejected' && (
            <div
              className="flex gap-2.5 rounded-2xl p-4 mt-3"
              style={{
                background: 'rgba(244,63,94,0.05)',
                border: '1px solid rgba(244,63,94,0.14)',
              }}
            >
              <AlertTriangle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-rose-300 mb-0.5">Reason</p>
                <p className="text-[11px] text-rose-300/60">{post.rejectionReason}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
            style={{
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.18)',
              color: '#fda4af',
            }}
          >
            <Trash2 size={15} />
            {isDeleting ? 'Deleting Post...' : 'Delete Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyPostCard({ post, onView }: { post: PendingPost; onView: () => void }) {
  const item = post.post;

  return (
    <button
      onClick={onView}
      className="w-full flex gap-3 p-4 rounded-3xl text-left transition-all active:scale-[0.98] mb-3"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
        {item.image ? (
          <>
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white/35"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.14) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <FileEdit size={16} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-2 mb-1.5">
          {item.title}
        </h3>

        <p className="text-[11px] text-white/42 leading-relaxed line-clamp-2 mb-2">
          {item.summary || item.content || 'No description available.'}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <TagBadge label={item.category} variant={item.categoryTag} dot size="sm" />
          <StatusBadge status={post.status} size="sm" />
        </div>

        <p className="text-[10px] text-white/25 mt-1.5 flex items-center gap-1">
          <Clock size={9} />
          {post.submittedAt}
        </p>
      </div>

      <ChevronRight size={14} className="text-white/20 flex-shrink-0 self-center" />
    </button>
  );
}

export default function MyPostsPage() {
  const { myPosts, deleteMyPost } = useModeration();
  const [selected, setSelected] = useState<PendingPost | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const stats = useMemo(() => {
    const pendingClub = myPosts.filter((p) => p.status === 'pending_club_review').length;
    const pendingAdmin = myPosts.filter((p) => p.status === 'pending_admin_review').length;
    const approved = myPosts.filter((p) => p.status === 'approved').length;
    const rejected = myPosts.filter((p) => p.status === 'rejected').length;

    return {
      pendingClub,
      pendingAdmin,
      approved,
      rejected,
      totalPending: pendingClub + pendingAdmin,
    };
  }, [myPosts]);

  const handleDelete = async () => {
    if (!selected) return;

    const confirmed = window.confirm('Delete this post permanently?');
    if (!confirmed) return;

    setDeletingId(selected.id);

    try {
      const result = await deleteMyPost(selected.id);
      if (result.error) {
        window.alert(result.error);
        return;
      }

      setSelected(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-dvh pb-24">
      <div className="pt-12 px-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.22)',
            }}
          >
            <FileEdit size={16} className="text-emerald-400" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.025em' }}>
              My Posts
            </h1>
            <p className="text-[11px] text-white/35">Track your submission status</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            {
              label: 'Pending',
              count: stats.totalPending,
              color: '#fbbf24',
              bg: 'rgba(251,191,36,0.08)',
              border: 'rgba(251,191,36,0.18)',
            },
            {
              label: 'Approved',
              count: stats.approved,
              color: '#34d399',
              bg: 'rgba(52,211,153,0.08)',
              border: 'rgba(52,211,153,0.18)',
            },
            {
              label: 'Rejected',
              count: stats.rejected,
              color: '#f43f5e',
              bg: 'rgba(244,63,94,0.08)',
              border: 'rgba(244,63,94,0.18)',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-3 rounded-2xl"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <p className="text-xl font-black" style={{ color: s.color }}>
                {s.count}
              </p>
              <p className="text-[10px] font-bold" style={{ color: `${s.color}99` }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {(stats.pendingClub > 0 || stats.pendingAdmin > 0) && (
          <div
            className="rounded-2xl px-4 py-3 mt-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5">
              Pending Breakdown
            </p>
            <p className="text-[12px] text-white/55">
              Club review: <span className="text-amber-300 font-bold">{stats.pendingClub}</span>
              <span className="mx-2 text-white/15">•</span>
              Admin review: <span className="text-primary-300 font-bold">{stats.pendingAdmin}</span>
            </p>
          </div>
        )}
      </div>

      <div className="px-4">
        {myPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <FileEdit size={22} className="text-white/20" />
            </div>
            <p className="text-sm font-bold text-white/40">No posts yet</p>
            <p className="text-[12px] text-white/20 mt-1">Submit a post from the Feed page</p>
          </div>
        ) : (
          myPosts.map((post) => (
            <MyPostCard key={post.id} post={post} onView={() => setSelected(post)} />
          ))
        )}
      </div>

      {selected && (
        <PostDetailSheet
          post={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          isDeleting={deletingId === selected.id}
        />
      )}
    </div>
  );
}
