import { useState, useRef, ChangeEvent } from 'react';
import {
  X, Image as ImageIcon, Eye, EyeOff,
  Send, Calendar, Link2, Loader2, CheckCircle2, AlertCircle,
  FileText, Users, Newspaper,
} from 'lucide-react';
import TagBadge from './TagBadge';
import PostPreviewCard from './PostPreviewCard';
import { generateId } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import { useModeration } from '../context/ModerationContext';
import { FeedItem, TagVariant } from '../data/feed';

type PostType = 'clubs' | 'students' | 'news';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POST_TYPES: { value: PostType; label: string; icon: typeof FileText; color: string; tag: TagVariant; role: string }[] = [
  { value: 'clubs', label: 'Club Post', icon: Users, color: '#818cf8', tag: 'violet', role: 'Club' },
  { value: 'students', label: 'Student Post', icon: FileText, color: '#34d399', tag: 'emerald', role: 'Student' },
  { value: 'news', label: 'News Post', icon: Newspaper, color: '#38bdf8', tag: 'blue', role: 'Official' },
];

const CATEGORY_LABELS: Record<PostType, string> = {
  clubs: 'Club',
  students: 'Student',
  news: 'News',
};

const PEXELS_PLACEHOLDERS: Record<PostType, string> = {
  clubs: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  students: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
  news: 'https://images.pexels.com/photos/267582/pexels-photo-267582.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const inputStyle = (hasError?: boolean) => ({
  background: 'rgba(255,255,255,0.055)',
  border: `1px solid ${hasError ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
  outline: 'none',
  color: 'white',
});

const inputCls = 'w-full px-4 py-3 rounded-2xl text-sm font-medium placeholder-white/25 transition-all duration-200';

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { submitForReview } = useModeration();
  const { user } = useAuth();

  const [postType, setPostType] = useState<PostType>('clubs');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [regLink, setRegLink] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentType = POST_TYPES.find((t) => t.value === postType)!;

  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImageUrl(url);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!summary.trim()) errs.summary = 'Short summary is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    return errs;
  };

  const buildPreviewItem = (): FeedItem => ({
    id: generateId(),
    type: postType,
    author: user?.name ?? 'You',
    authorRole: postType === 'clubs'
      ? 'Club'
      : postType === 'news'
      ? 'Official'
      : `Student · ${user?.branch ?? ''} ${user?.year ?? ''}`,
    authorName: user?.name ?? 'You',
    avatar: undefined,
    time: 'Just now',
    category: CATEGORY_LABELS[postType],
    categoryTag: currentType.tag,
    title: title || 'Untitled Post',
    summary: summary || 'No summary yet.',
    fullContent: description ? description.split('\n').filter(Boolean) : ['No content.'],
    image: imagePreview || PEXELS_PLACEHOLDERS[postType],
    eventDetails: postType === 'clubs' && (eventDate || eventLocation)
      ? {
          date: eventDate || 'TBD',
          time: eventTime || 'TBD',
          location: eventLocation || 'TBD',
          seats: null,
          registerLabel: regLink ? 'Register' : 'Learn More',
        }
      : undefined,
    likes: 0,
    comments: 0,
    saved: false,
    liked: false,
  });

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    const authorRole =
      postType === 'clubs'
        ? 'Club'
        : postType === 'news'
        ? 'Official'
        : `Student · ${user?.branch ?? ''} ${user?.year ?? ''}`;
    submitForReview(buildPreviewItem(), user?.name ?? 'You', authorRole);
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 1800);
  };

  const handleClose = () => {
    setTitle(''); setSummary(''); setDescription('');
    setImageUrl(''); setImagePreview('');
    setEventDate(''); setEventTime(''); setEventLocation(''); setRegLink('');
    setShowPreview(false); setErrors({});
    setSubmitting(false); setSubmitted(false);
    onClose();
  };

  const sectionCard = (children: React.ReactNode) => (
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="flex-1 overflow-y-auto mx-auto w-full max-w-[430px] flex flex-col"
        style={{ paddingBottom: '2rem' }}
      >
        {/* Header */}
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
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
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
          {/* Post type selector */}
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {POST_TYPES.map((t) => {
                const Icon = t.icon;
                const active = postType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => { setPostType(t.value); setShowPreview(false); }}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.97]"
                    style={{
                      background: active
                        ? `${t.color}18`
                        : 'rgba(255,255,255,0.04)',
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
          </div>

          {/* Preview mode */}
          {showPreview ? (
            <div className="slide-up">
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="h-[1px] flex-1"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider px-2">Preview</p>
                <div
                  className="h-[1px] flex-1"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
              </div>
              <PostPreviewCard item={buildPreviewItem()} />
              <p className="text-center text-[10px] text-white/20 mt-3">
                This is how your post will appear in the Feed
              </p>
            </div>
          ) : (
            <div className="fade-in">
              {/* Image upload */}
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
                        <p className="text-[11px] text-white/25 font-medium">Tap to upload cover image</p>
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

              {/* Core fields */}
              {sectionCard(
                <>
                  {label('Post Details')}
                  <div className="flex flex-col gap-3">
                    <div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
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
                        onChange={(e) => { setSummary(e.target.value); setErrors((p) => ({ ...p, summary: '' })); }}
                        placeholder="Short summary (shown in Feed preview)"
                        className={inputCls}
                        style={inputStyle(!!errors.summary)}
                      />
                      {fieldError('summary')}
                    </div>
                    <div>
                      <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
                        placeholder="Full description..."
                        rows={4}
                        className={`${inputCls} resize-none`}
                        style={inputStyle(!!errors.description)}
                      />
                      {fieldError('description')}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <TagBadge label={CATEGORY_LABELS[postType]} variant={currentType.tag} dot size="sm" />
                      </div>
                      <p className="text-[10px] text-white/25">Category tag applied automatically</p>
                    </div>
                  </div>
                </>
              )}

              {/* Event fields (clubs only) */}
              {postType === 'clubs' && sectionCard(
                <>
                  {label('Event Details (Optional)')}
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                      <input
                        type="text"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        placeholder="Event date (e.g. December 20, 2025)"
                        className={`${inputCls} pl-10`}
                        style={inputStyle()}
                      />
                    </div>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="Time (e.g. 9:00 AM – 5:00 PM)"
                      className={inputCls}
                      style={inputStyle()}
                    />
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Location (e.g. Engineering Block, Room 101)"
                      className={inputCls}
                      style={inputStyle()}
                    />
                    <div className="relative">
                      <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                      <input
                        type="url"
                        value={regLink}
                        onChange={(e) => setRegLink(e.target.value)}
                        placeholder="Registration link (optional)"
                        className={`${inputCls} pl-10`}
                        style={inputStyle()}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Review notice */}
              <div
                className="flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-4"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#fbbf24' }} />
                <p className="text-[11px] text-amber-300/70 leading-relaxed">
                  All posts are reviewed before appearing in the public feed.
                </p>
              </div>

              {/* Submit */}
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
                    Post Submitted!
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
}
