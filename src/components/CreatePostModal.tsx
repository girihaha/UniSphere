import { useState, useRef, ChangeEvent, type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Send,
  Calendar,
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Newspaper,
  Info,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import TagBadge from './TagBadge';
import PostPreviewCard from './PostPreviewCard';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import { useModeration } from '../context/ModerationContext';
import { createPost } from '../services/feedService';
import { getManagedClubs } from '../services/clubService';
import type { Post as FeedItem, TagVariant, Club, PostType, PostKind } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PostAsMode = 'personal' | 'club';

const POST_TYPES: {
  value: PostType;
  label: string;
  icon: typeof FileText;
  color: string;
  tag: TagVariant;
}[] = [
  { value: 'clubs', label: 'Club Category', icon: Users, color: '#818cf8', tag: 'violet' },
  { value: 'students', label: 'Student Category', icon: FileText, color: '#34d399', tag: 'emerald' },
  { value: 'news', label: 'News Category', icon: Newspaper, color: '#38bdf8', tag: 'blue' },
];

const POST_KINDS: {
  value: PostKind;
  label: string;
  icon: typeof FileText;
  color: string;
}[] = [
  { value: 'post', label: 'Post', icon: FileText, color: '#a78bfa' },
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: '#f59e0b' },
  { value: 'event', label: 'Event', icon: Calendar, color: '#22c55e' },
];

const CATEGORY_LABELS: Record<PostType, string> = {
  clubs: 'Club',
  students: 'Student',
  news: 'News',
};

const PEXELS_PLACEHOLDERS: Record<PostType, string> = {
  clubs:
    'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  students:
    'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
  news:
    'https://images.pexels.com/photos/267582/pexels-photo-267582.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const inputStyle = (hasError?: boolean) => ({
  background: 'rgba(255,255,255,0.055)',
  border: `1px solid ${hasError ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
  outline: 'none',
  color: 'white',
});

const inputCls =
  'w-full px-4 py-3 rounded-2xl text-sm font-medium placeholder-white/25 transition-all duration-200';

function normalizeManagedClub(rawClub: any): Club {
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
    heroImage: rawClub.coverImage || rawClub.avatar || '',
    categoryTag,
    color,
    tagline: rawClub.username || rawClub.description || '',
    founded: rawClub.founded || '2024',
    type: rawClub.type || rawClub.category || 'Club',
    logoImage: rawClub.avatar || '',
    recommended: false,
    posts: rawClub.posts || [],
    members: String(rawClub.members ?? 0),
  };
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user, refreshUser } = useAuth();
  const { refreshFeed } = useFeed();
  const { submitForReview, refreshModeration } = useModeration();

  const canPostAsClub = user?.role === 'club_admin' || user?.role === 'super_admin';

  const [managedClubs, setManagedClubs] = useState<Club[]>([]);
  const [loadingManagedClubs, setLoadingManagedClubs] = useState(false);

  const [postType, setPostType] = useState<PostType>('clubs');
  const [postAs, setPostAs] = useState<PostAsMode>('personal');
  const [postKind, setPostKind] = useState<PostKind>('post');
  const [selectedClubId, setSelectedClubId] = useState<number | undefined>(undefined);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [regLink, setRegLink] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !canPostAsClub) return;

    let active = true;

    const loadManagedClubs = async () => {
      setLoadingManagedClubs(true);
      try {
        const clubs = await getManagedClubs();
        if (!active) return;

        const normalized = (clubs || []).map(normalizeManagedClub);
        setManagedClubs(normalized);

        if (normalized.length === 1) {
          setSelectedClubId(normalized[0].id);
        }
      } catch (error) {
        console.error('Failed to load managed clubs:', error);
        if (active) {
          setManagedClubs([]);
        }
      } finally {
        if (active) {
          setLoadingManagedClubs(false);
        }
      }
    };

    loadManagedClubs();

    return () => {
      active = false;
    };
  }, [isOpen, canPostAsClub]);

  useEffect(() => {
    if (!canPostAsClub && postAs === 'club') {
      setPostAs('personal');
    }
  }, [canPostAsClub, postAs]);

  useEffect(() => {
    if (postAs === 'club') {
      setPostType('clubs');
    }
  }, [postAs]);

  if (!isOpen || !mounted) return null;

  const currentType = POST_TYPES.find((t) => t.value === postType)!;
  const currentManagedClub =
    postAs === 'club' ? managedClubs.find((club) => club.id === selectedClubId) : undefined;

  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImageFile(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = 'Title is required.';
    if (!summary.trim()) errs.summary = 'Short summary is required.';
    if (!description.trim()) errs.description = 'Description is required.';

    if (postAs === 'club') {
      if (!selectedClubId) {
        errs.clubId = 'Please select a club.';
      }

      if (!canPostAsClub) {
        errs.postAs = 'You are not allowed to post as a club.';
      }
    }

    if (postKind === 'event') {
      if (!eventDate.trim()) errs.eventDate = 'Event date is required.';
      if (!eventTime.trim()) errs.eventTime = 'Event time is required.';
      if (!eventLocation.trim()) errs.eventLocation = 'Event location is required.';
    }

    if (regLink.trim()) {
      try {
        const parsedUrl = new URL(regLink.trim());
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          errs.registerLink = 'Use a valid http or https URL.';
        }
      } catch {
        errs.registerLink = 'Use a valid URL.';
      }
    }

    return errs;
  };

  const buildPreviewItem = (): FeedItem => {
    const authorName =
      postAs === 'club'
        ? currentManagedClub?.name || 'Selected Club'
        : user?.name ?? 'You';

    const authorRole =
      postAs === 'club'
        ? 'Club'
        : postType === 'news'
        ? 'Official'
        : `Student · ${user?.branch ?? ''} ${user?.year ?? ''}`.trim();

    const kindLabel =
      postKind === 'announcement'
        ? 'Announcement'
        : postKind === 'event'
        ? 'Event'
        : CATEGORY_LABELS[postType];

    return {
      id: Date.now(),
      type: postType,
      kind: postKind,
      authorType: postAs === 'club' ? 'club' : 'user',
      author: authorName,
      authorId: user?.id,
      authorRole,
      avatar:
        postAs === 'club'
          ? currentManagedClub?.avatar || currentManagedClub?.logoImage || undefined
          : user?.avatarUrl,
      authorName,
      userAvatar: user?.avatarUrl,
      clubId: postAs === 'club' ? selectedClubId : undefined,
      clubName: postAs === 'club' ? currentManagedClub?.name : undefined,
      clubAvatar:
        postAs === 'club'
          ? currentManagedClub?.avatar || currentManagedClub?.logoImage || undefined
          : undefined,
      time: 'Just now',
      category: kindLabel,
      categoryTag: currentType.tag,
      title: title || 'Untitled Post',
      summary: summary || 'No summary yet.',
      fullContent: description ? description.split('\n').filter(Boolean) : ['No content.'],
      content: description || 'No content.',
      image: imagePreview || PEXELS_PLACEHOLDERS[postType],
      eventDetails:
        postKind === 'event' || regLink
          ? {
              date: postKind === 'event' ? eventDate || 'TBD' : undefined,
              time: postKind === 'event' ? eventTime || 'TBD' : undefined,
              location: postKind === 'event' ? eventLocation || 'TBD' : undefined,
              seats: null,
              registerLabel: regLink ? ctaLabel.trim() || 'Register Now' : undefined,
              registerLink: regLink || undefined,
            }
          : undefined,
      likes: 0,
      comments: 0,
      saved: false,
      liked: false,
      status: 'pending_admin_review',
    };
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitError('');
    setSubmitMessage('');
    setSubmitting(true);

    try {
      const result = await createPost({
        title: title.trim(),
        summary: summary.trim(),
        content: description.trim(),
        type: postAs === 'club' ? 'clubs' : postType,
        postAs,
        kind: postKind,
        clubId: postAs === 'club' ? selectedClubId : undefined,
        eventDate: postKind === 'event' ? eventDate.trim() : undefined,
        eventTime: postKind === 'event' ? eventTime.trim() : undefined,
        eventLocation: postKind === 'event' ? eventLocation.trim() : undefined,
        registerLabel: regLink.trim() ? ctaLabel.trim() || 'Register Now' : undefined,
        registerLink: regLink.trim() || undefined,
        imageFile,
      });

      if (result.error) {
        setSubmitError(result.error);
        setSubmitting(false);
        return;
      }

      if (result.post && user) {
        submitForReview(
          result.post,
          user.name,
          user.role === 'super_admin'
            ? 'Super Admin'
            : user.role === 'club_admin'
            ? 'Club Admin'
            : 'Student'
        );
      }

      await refreshFeed();
      await refreshUser();
      await refreshModeration();

      setSubmitMessage(result.message || 'Post submitted successfully.');
      setSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (error) {
      console.error(error);
      setSubmitError('Failed to create post.');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPostType('clubs');
    setPostAs('personal');
    setPostKind('post');
    setSelectedClubId(undefined);

    setTitle('');
    setSummary('');
    setDescription('');
    setImagePreview('');
    setImageFile(null);

    setEventDate('');
    setEventTime('');
    setEventLocation('');
    setCtaLabel('');
    setRegLink('');

    setShowPreview(false);
    setErrors({});
    setSubmitting(false);
    setSubmitted(false);
    setSubmitError('');
    setSubmitMessage('');
    onClose();
  };

  const sectionCard = (children: ReactNode) => (
    <div
      className="rounded-3xl p-4 mb-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </div>
  );

  const label = (text: string) => (
    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">{text}</p>
  );

  const fieldError = (key: string) =>
    errors[key] ? (
      <div className="flex items-center gap-1.5 mt-1.5 ml-1">
        <AlertCircle size={10} className="text-rose-400" />
        <p className="text-[10px] text-rose-400">{errors[key]}</p>
      </div>
    ) : null;

  const getSubmissionHint = () => {
    if (user?.role === 'super_admin') {
      return postAs === 'club'
        ? 'This club post will be published immediately after submission.'
        : 'Your post will be published immediately after submission.';
    }

    if (postAs === 'club') {
      return 'This club post will be sent for admin review after submission.';
    }

    return 'Your personal post will be sent for admin review after submission.';
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9997] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
    >
      <div
        className="flex-1 overflow-y-auto mx-auto w-full max-w-[430px] flex flex-col"
        style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 pt-12 pb-4"
          style={{
            background: 'linear-gradient(180deg, rgba(10,14,26,0.98) 0%, rgba(10,14,26,0.92) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={handleClose}
            className="p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X size={17} />
          </button>

          <h2 className="text-base font-extrabold text-white tracking-tight">Create Post</h2>

          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors active:scale-95"
            style={{
              background: showPreview ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showPreview ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: showPreview ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
            }}
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>

        <div className="px-4 pt-4">
          {sectionCard(
            <>
              {label('Post As')}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setPostAs('personal');
                    setErrors((prev) => ({ ...prev, postAs: '', clubId: '' }));
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.97]"
                  style={{
                    background: postAs === 'personal' ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      postAs === 'personal' ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.08)'
                    }`,
                    color: postAs === 'personal' ? '#6ee7b7' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  <FileText size={15} />
                  Personal
                </button>

                <button
                  onClick={() => {
                    if (!canPostAsClub) return;
                    setPostAs('club');
                    setPostType('clubs');
                    setErrors((prev) => ({ ...prev, postAs: '' }));
                  }}
                  disabled={!canPostAsClub}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-45"
                  style={{
                    background: postAs === 'club' ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      postAs === 'club' ? 'rgba(99,102,241,0.38)' : 'rgba(255,255,255,0.08)'
                    }`,
                    color: postAs === 'club' ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  <Users size={15} />
                  Post as Club
                </button>
              </div>

              {!canPostAsClub && (
                <p className="text-[10px] text-white/28 mt-2">
                  Only club admins and super admins can post as a club.
                </p>
              )}

              {fieldError('postAs')}
            </>
          )}

          {postAs === 'club' &&
            sectionCard(
              <>
                {label('Select Club')}
                <div className="flex flex-col gap-2">
                  {loadingManagedClubs ? (
                    <div
                      className="rounded-2xl px-4 py-3 text-sm text-white/40"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      Loading managed clubs...
                    </div>
                  ) : managedClubs.length === 0 ? (
                    <div
                      className="rounded-2xl px-4 py-3 text-sm text-rose-300"
                      style={{
                        background: 'rgba(244,63,94,0.08)',
                        border: '1px solid rgba(244,63,94,0.18)',
                      }}
                    >
                      No managed clubs found for this account.
                    </div>
                  ) : (
                    managedClubs.map((club) => {
                      const active = selectedClubId === club.id;

                      return (
                        <button
                          key={club.id}
                          onClick={() => {
                            setSelectedClubId(club.id);
                            setErrors((prev) => ({ ...prev, clubId: '' }));
                          }}
                          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                          style={{
                            background: active ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${
                              active ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'
                            }`,
                          }}
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${club.color} flex items-center justify-center overflow-hidden flex-shrink-0`}
                          >
                            {club.avatar || club.logoImage ? (
                              <img
                                src={club.avatar || club.logoImage}
                                alt={club.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-sm font-bold">
                                {club.name.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{club.name}</p>
                            <p className="text-[11px] text-white/35 truncate">
                              {club.category} · {club.tagline || 'Managed club'}
                            </p>
                          </div>

                          {active && <CheckCircle2 size={16} className="text-indigo-300" />}
                        </button>
                      );
                    })
                  )}
                </div>
                {fieldError('clubId')}
              </>
            )}

          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {POST_TYPES.map((t) => {
                const Icon = t.icon;
                const active = postType === t.value;
                const disabled = postAs === 'club' && t.value !== 'clubs';

                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      if (disabled) return;
                      setPostType(t.value);
                      setShowPreview(false);
                    }}
                    disabled={disabled}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40"
                    style={{
                      background: active ? `${t.color}18` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? `${t.color}44` : 'rgba(255,255,255,0.08)'}`,
                      color: active ? t.color : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            {postAs === 'club' && (
              <p className="text-[10px] text-white/24 mt-2">
                Club-authored posts are automatically placed in the Club category.
              </p>
            )}
          </div>

          {sectionCard(
            <>
              {label('Content Type')}
              <div className="grid grid-cols-3 gap-2">
                {POST_KINDS.map((kind) => {
                  const Icon = kind.icon;
                  const active = postKind === kind.value;

                  return (
                    <button
                      key={kind.value}
                      onClick={() => setPostKind(kind.value)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.97]"
                      style={{
                        background: active ? `${kind.color}18` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? `${kind.color}44` : 'rgba(255,255,255,0.08)'}`,
                        color: active ? kind.color : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      <Icon size={16} />
                      {kind.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {showPreview ? (
            <div className="slide-up">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-[1px] flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider px-2">
                  Preview
                </p>
                <div className="h-[1px] flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <PostPreviewCard item={buildPreviewItem()} />

              <p className="text-center text-[10px] text-white/20 mt-3">
                This is how your post will appear after approval and publishing
              </p>
            </div>
          ) : (
            <div className="fade-in">
              {sectionCard(
                <>
                  {label('Cover Image')}
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.99]"
                    style={{
                      height: imagePreview ? '160px' : '100px',
                      background: imagePreview ? 'transparent' : 'rgba(255,255,255,0.03)',
                      border: imagePreview ? 'none' : '1.5px dashed rgba(255,255,255,0.15)',
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
                            style={{ background: 'rgba(0,0,0,0.5)' }}
                          >
                            Change Image
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <ImageIcon size={20} className="text-white/20" />
                        <p className="text-[11px] text-white/25 font-medium">
                          Tap to upload cover image
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFile}
                  />
                </>
              )}

              {sectionCard(
                <>
                  {label('Post Details')}
                  <div className="flex flex-col gap-3">
                    <div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setErrors((p) => ({ ...p, title: '' }));
                        }}
                        placeholder="Title"
                        className={inputCls}
                        style={inputStyle(!!errors.title)}
                      />
                      {fieldError('title')}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={summary}
                        onChange={(e) => {
                          setSummary(e.target.value);
                          setErrors((p) => ({ ...p, summary: '' }));
                        }}
                        placeholder="Short summary (shown in feed preview)"
                        className={inputCls}
                        style={inputStyle(!!errors.summary)}
                      />
                      {fieldError('summary')}
                    </div>

                    <div>
                      <textarea
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setErrors((p) => ({ ...p, description: '' }));
                        }}
                        placeholder="Full description..."
                        rows={4}
                        className={`${inputCls} resize-none`}
                        style={inputStyle(!!errors.description)}
                      />
                      {fieldError('description')}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <TagBadge
                          label={CATEGORY_LABELS[postAs === 'club' ? 'clubs' : postType]}
                          variant={currentType.tag}
                          dot
                          size="sm"
                        />
                      </div>

                      <div
                        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Sparkles size={12} className="text-white/45" />
                        <span className="text-[11px] font-semibold text-white/55 capitalize">
                          {postKind}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {postKind === 'event' &&
                sectionCard(
                  <>
                    {label('Event Details')}
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="relative">
                          <Calendar
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                          />
                          <input
                            type="text"
                            value={eventDate}
                            onChange={(e) => {
                              setEventDate(e.target.value);
                              setErrors((p) => ({ ...p, eventDate: '' }));
                            }}
                            placeholder="Event date (e.g. April 20, 2026)"
                            className={`${inputCls} pl-10`}
                            style={inputStyle(!!errors.eventDate)}
                          />
                        </div>
                        {fieldError('eventDate')}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={eventTime}
                          onChange={(e) => {
                            setEventTime(e.target.value);
                            setErrors((p) => ({ ...p, eventTime: '' }));
                          }}
                          placeholder="Time (e.g. 9:00 AM – 5:00 PM)"
                          className={inputCls}
                          style={inputStyle(!!errors.eventTime)}
                        />
                        {fieldError('eventTime')}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={eventLocation}
                          onChange={(e) => {
                            setEventLocation(e.target.value);
                            setErrors((p) => ({ ...p, eventLocation: '' }));
                          }}
                          placeholder="Location (e.g. Engineering Block, Room 101)"
                          className={inputCls}
                          style={inputStyle(!!errors.eventLocation)}
                        />
                        {fieldError('eventLocation')}
                      </div>

                    </div>
                  </>
                )}

              {sectionCard(
                <>
                  {label('Optional CTA')}
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      placeholder="Button label (e.g. Register Now)"
                      className={inputCls}
                      style={inputStyle()}
                    />

                    <div>
                      <div className="relative">
                        <Link2
                          size={14}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                        />
                        <input
                          type="url"
                          value={regLink}
                          onChange={(e) => {
                            setRegLink(e.target.value);
                            setErrors((p) => ({ ...p, registerLink: '' }));
                          }}
                          placeholder="CTA URL (optional)"
                          className={`${inputCls} pl-10`}
                          style={inputStyle(!!errors.registerLink)}
                        />
                      </div>
                      {fieldError('registerLink')}
                    </div>
                  </div>
                </>
              )}

              {submitError && (
                <div
                  className="flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-4"
                  style={{
                    background: 'rgba(244,63,94,0.08)',
                    border: '1px solid rgba(244,63,94,0.2)',
                  }}
                >
                  <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-rose-300">{submitError}</p>
                </div>
              )}

              {submitMessage && (
                <div
                  className="flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-4"
                  style={{
                    background: 'rgba(52,211,153,0.08)',
                    border: '1px solid rgba(52,211,153,0.2)',
                  }}
                >
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-emerald-300">{submitMessage}</p>
                </div>
              )}

              <div
                className="flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-4"
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.18)',
                }}
              >
                <Info size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-primary-200/75 leading-relaxed">{getSubmissionHint()}</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || submitted}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-70 mb-6"
                style={{
                  background: submitted
                    ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: submitting || submitted ? 'none' : '0 6px 20px rgba(99,102,241,0.4)',
                }}
              >
                {submitted ? (
                  <>
                    <CheckCircle2 size={16} />
                    Done
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Post
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
