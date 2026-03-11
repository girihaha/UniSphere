import { useState } from 'react';
import {
  Shield, ChevronRight, Check, X, Eye,
  Clock, Users, FileText, Newspaper,
  AlertTriangle, ArrowLeft, CheckCircle2,
  XCircle, Calendar, MapPin, User,
} from 'lucide-react';
import { useModeration } from '../context/ModerationContext';
import { useAuth } from '../context/AuthContext';
import { PendingPost, PostStatus, WorkflowStep } from '../data/moderation';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import TagBadge from '../components/TagBadge';

type DashFilter = 'all' | 'pending' | 'approved' | 'rejected';

const TYPE_ICONS = {
  clubs: Users,
  students: FileText,
  news: Newspaper,
};

function WorkflowTracker({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div
            className="px-2 py-0.5 rounded-lg text-[9px] font-bold"
            style={{
              background: step.completed
                ? 'rgba(52,211,153,0.12)'
                : step.current
                ? 'rgba(99,102,241,0.15)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${
                step.completed
                  ? 'rgba(52,211,153,0.3)'
                  : step.current
                  ? 'rgba(99,102,241,0.35)'
                  : 'rgba(255,255,255,0.07)'
              }`,
              color: step.completed
                ? '#34d399'
                : step.current
                ? '#a5b4fc'
                : 'rgba(255,255,255,0.25)',
            }}
          >
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={9} className="text-white/15" />
          )}
        </div>
      ))}
    </div>
  );
}

function RejectModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl p-5 pb-10"
        style={{
          background: 'linear-gradient(180deg, rgba(18,22,36,0.99) 0%, rgba(10,14,26,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
        }}
      >
        <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-5" />
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)' }}>
            <XCircle size={15} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Reject Post</h3>
            <p className="text-[10px] text-white/35">Provide a reason for rejection</p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (optional)..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-white/20 resize-none mb-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white/50 transition-all active:scale-[0.97]"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', boxShadow: '0 4px 16px rgba(244,63,94,0.35)' }}
          >
            Reject Post
          </button>
        </div>
      </div>
    </div>
  );
}

function PostDetailView({
  post,
  onBack,
  onApprove,
  onReject,
}: {
  post: PendingPost;
  onBack: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const item = post.feedItem;
  const isPending = post.status === 'pending';

  return (
    <div
      className="fixed inset-0 z-[55] overflow-y-auto"
      style={{ background: 'rgba(10,14,26,0.98)', backdropFilter: 'blur(16px)' }}
    >
      <div className="mx-auto max-w-[430px]">
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-12 pb-4"
          style={{
            background: 'rgba(10,14,26,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-white truncate">{item.title}</h2>
            <p className="text-[10px] text-white/35">{post.submittedAt}</p>
          </div>
          <StatusBadge status={post.status} size="sm" />
        </div>

        <div className="px-4 pt-4 pb-32">
          {/* Cover image */}
          {item.image && (
            <div className="rounded-3xl overflow-hidden h-52 mb-4">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Tags row */}
          <div className="flex items-center gap-2 mb-4">
            <TagBadge label={item.category} variant={item.categoryTag} dot size="sm" />
          </div>

          {/* Author */}
          <div
            className="flex items-center gap-3 p-3.5 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <User size={16} className="text-white/40" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">{post.submittedBy}</p>
              <p className="text-[10px] text-white/35">{post.submittedByRole}</p>
            </div>
          </div>

          {/* Title & content */}
          <h1 className="text-xl font-extrabold text-white leading-tight mb-2" style={{ letterSpacing: '-0.025em' }}>
            {item.title}
          </h1>
          <p className="text-sm text-white/55 leading-relaxed mb-5">{item.summary}</p>

          {item.fullContent.map((para, i) => (
            <p key={i} className="text-[13px] text-white/60 leading-relaxed mb-3">
              {para}
            </p>
          ))}

          {/* Event details */}
          {item.eventDetails && (
            <div
              className="rounded-2xl p-4 mb-4 mt-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">Event Details</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[12px] text-white/55">
                  <Calendar size={12} className="text-white/25 flex-shrink-0" />
                  {item.eventDetails.date}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-white/55">
                  <Clock size={12} className="text-white/25 flex-shrink-0" />
                  {item.eventDetails.time}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-white/55">
                  <MapPin size={12} className="text-white/25 flex-shrink-0" />
                  {item.eventDetails.location}
                </div>
              </div>
            </div>
          )}

          {/* Workflow */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">Approval Workflow</p>
            <WorkflowTracker steps={post.workflow} />
          </div>

          {/* Rejection reason */}
          {post.status === 'rejected' && post.rejectionReason && (
            <div
              className="flex gap-2.5 rounded-2xl p-4 mt-3"
              style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              <AlertTriangle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-rose-400 mb-0.5">Rejection Reason</p>
                <p className="text-[12px] text-rose-300/70">{post.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        {isPending && (
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-8 pt-3"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(10,14,26,0.98) 40%)',
            }}
          >
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.97]"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}
              >
                <X size={15} />
                Reject
              </button>
              <button
                onClick={onApprove}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}
              >
                <Check size={15} />
                Approve Post
              </button>
            </div>
          </div>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          onConfirm={(reason) => { setShowRejectModal(false); onReject(reason); }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
}

function PendingPostCard({
  post,
  onView,
  onApprove,
  onReject,
}: {
  post: PendingPost;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const item = post.feedItem;
  const TypeIcon = TYPE_ICONS[item.type];

  return (
    <div
      className="rounded-3xl overflow-hidden mb-3"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      <div className="flex gap-3 p-4">
        {/* Thumb */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-2 flex-1">{item.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TagBadge label={item.category} variant={item.categoryTag} dot size="sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar name={post.submittedBy} size={14} />
            <p className="text-[10px] text-white/35 truncate">{post.submittedBy}</p>
            <span className="text-white/15 text-[10px]">·</span>
            <div className="flex items-center gap-1 text-[10px] text-white/25">
              <Clock size={9} />
              {post.submittedAt}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="px-4 pb-3">
        <WorkflowTracker steps={post.workflow} />
      </div>

      {/* Action buttons */}
      {post.status === 'pending' ? (
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e' }}
          >
            <X size={12} />
            Reject
          </button>
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}
          >
            <Check size={12} />
            Approve
          </button>
          <button
            onClick={onView}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
          >
            <Eye size={12} />
            View
          </button>
        </div>
      ) : (
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <StatusBadge status={post.status} size="sm" />
          <button
            onClick={onView}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
          >
            <Eye size={12} />
            View Details
          </button>
        </div>
      )}
    </div>
  );
}

export default function ModerationDashboard() {
  const { pendingPosts, approvePost, rejectPost } = useModeration();
  const { user } = useAuth();
  const [filter, setFilter] = useState<DashFilter>('pending');
  const [selectedPost, setSelectedPost] = useState<PendingPost | null>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);

  const filtered =
    filter === 'all'
      ? pendingPosts
      : pendingPosts.filter((p) => p.status === filter);

  const pendingCount = pendingPosts.filter((p) => p.status === 'pending').length;

  const FILTERS: { value: DashFilter; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
  ];

  const handleApprove = (id: number) => {
    approvePost(id);
    if (selectedPost?.id === id) setSelectedPost(null);
  };

  const handleReject = (id: number, reason: string) => {
    rejectPost(id, reason || undefined);
    setRejectTarget(null);
    if (selectedPost?.id === id) setSelectedPost(null);
  };

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div className="pt-12 px-4 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <Shield size={16} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.025em' }}>
              Moderation
            </h1>
            <p className="text-[11px] text-white/35">{user?.role === 'super_admin' ? 'Super Admin' : 'Club Admin'} · Content Review</p>
          </div>
          {pendingCount > 0 && (
            <div
              className="ml-auto px-2.5 py-1 rounded-xl text-[11px] font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              {pendingCount}
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div
          className="flex gap-1 p-1 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95"
              style={{
                background: filter === f.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filter === f.value ? 'white' : 'rgba(255,255,255,0.3)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <CheckCircle2 size={22} className="text-white/20" />
            </div>
            <p className="text-sm font-bold text-white/40">All clear</p>
            <p className="text-[12px] text-white/20 mt-1">No posts in this category</p>
          </div>
        ) : (
          filtered.map((post) => (
            <PendingPostCard
              key={post.id}
              post={post}
              onView={() => setSelectedPost(post)}
              onApprove={() => handleApprove(post.id)}
              onReject={() => setRejectTarget(post.id)}
            />
          ))
        )}
      </div>

      {/* Detail view */}
      {selectedPost && (
        <PostDetailView
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
          onApprove={() => handleApprove(selectedPost.id)}
          onReject={(reason) => handleReject(selectedPost.id, reason)}
        />
      )}

      {/* Quick reject modal */}
      {rejectTarget !== null && !selectedPost && (
        <RejectModal
          onConfirm={(reason) => handleReject(rejectTarget, reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
