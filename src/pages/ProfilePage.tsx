import { useEffect, useRef, useState } from 'react';
import {
  Github,
  Linkedin,
  Globe,
  Instagram,
  Settings,
  ChevronRight,
  Pen,
  LogOut,
  Bell,
  Shield,
  BookOpen,
  Award,
  User as UserIcon,
  Share2,
  Copy,
  Check,
  GraduationCap,
  Mail,
  Hash,
  CreditCard as Edit3,
  File as FileEdit,
  Users,
  Building2,
} from 'lucide-react';
import Avatar from '../components/Avatar';
import TagBadge from '../components/TagBadge';
import Button from '../components/Button';
import ModalContainer from '../components/ModalContainer';
import { useAuth } from '../context/AuthContext';
import { useModeration } from '../context/ModerationContext';
import {
  getUserProfile,
  updateUserProfile,
  getSocialLinks,
  updateSocialLinks,
  getRecentConnections,
  getAchievements,
  type RecentConnection,
} from '../services/profileService';
import { getSavedPosts } from '../services/feedService';
import type { User, SocialLink, Achievement, Post } from '../types';

const SOCIAL_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  portfolio: Globe,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: 'text-rose-400',
  linkedin: 'text-blue-400',
  github: 'text-white/70',
  portfolio: 'text-emerald-400',
};

const SOCIAL_BG: Record<string, string> = {
  instagram: 'rgba(251,113,133,0.12)',
  linkedin: 'rgba(96,165,250,0.12)',
  github: 'rgba(255,255,255,0.08)',
  portfolio: 'rgba(52,211,153,0.12)',
};

function normalizeSocialInput(platformId: string, value: string): string {
  const raw = value.trim();
  if (!raw) return '';

  const lower = raw.toLowerCase();

  if (platformId === 'instagram') {
    if (lower.startsWith('http://') || lower.startsWith('https://')) return raw;

    const cleaned = raw
      .replace(/^@+/, '')
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^instagram\.com\//i, '')
      .replace(/\/+$/, '');

    return cleaned ? `https://instagram.com/${cleaned}` : '';
  }

  if (platformId === 'linkedin') {
    if (lower.startsWith('http://') || lower.startsWith('https://')) return raw;

    const cleaned = raw
      .replace(/^https?:\/\/(www\.)?linkedin\.com\//i, '')
      .replace(/^linkedin\.com\//i, '')
      .replace(/^in\//i, '')
      .replace(/\/+$/, '');

    return cleaned ? `https://linkedin.com/in/${cleaned}` : '';
  }

  if (platformId === 'github') {
    if (lower.startsWith('http://') || lower.startsWith('https://')) return raw;

    const cleaned = raw
      .replace(/^@+/, '')
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^github\.com\//i, '')
      .replace(/\/+$/, '');

    return cleaned ? `https://github.com/${cleaned}` : '';
  }

  if (platformId === 'portfolio') {
    if (lower.startsWith('http://') || lower.startsWith('https://')) return raw;
    return `https://${raw.replace(/^https?:\/\//i, '')}`;
  }

  return raw;
}

function getSocialDisplayValue(platformId: string, value: string): string {
  const raw = value.trim();
  if (!raw) return '';

  const normalized = normalizeSocialInput(platformId, raw);

  if (!normalized) return '';

  if (platformId === 'instagram') {
    const cleaned = normalized
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/\/+$/, '');
    return cleaned ? `@${cleaned}` : normalized;
  }

  if (platformId === 'linkedin') {
    const cleaned = normalized
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
      .replace(/\/+$/, '');
    return cleaned ? `in/${cleaned}` : normalized;
  }

  if (platformId === 'github') {
    const cleaned = normalized
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/\/+$/, '');
    return cleaned || normalized;
  }

  if (platformId === 'portfolio') {
    return normalized.replace(/^https?:\/\//i, '');
  }

  return normalized;
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        />
        <span className="text-sm font-bold text-white tracking-tight">{title}</span>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-primary-400 active:opacity-60 transition-opacity"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}
      >
        <Icon size={15} className="text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{label}</p>
        <p className="text-[13px] font-semibold text-white/80 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onChangePhoto,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: User;
  onSave: (data: Partial<User>) => Promise<void>;
  onChangePhoto: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(profile.name || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [year, setYear] = useState(profile.year || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [cgpa, setCgpa] = useState(profile.cgpa || '');

  useEffect(() => {
    setName(profile.name || '');
    setBranch(profile.branch || '');
    setYear(profile.year || '');
    setBio(profile.bio || '');
    setCgpa(profile.cgpa || '');
  }, [profile]);

  const handleSave = async () => {
    await onSave({ name, branch, year, bio, cgpa });
    onClose();
  };

  const inputClass = `
    w-full rounded-2xl px-4 py-3 text-sm text-white outline-none font-medium
    transition-all placeholder-white/22
  `;
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };
  const focusStyle = `focus:border-primary-500/50 focus:bg-white/7`;

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col items-center mb-1">
          <div className="relative">
            <Avatar src={profile.avatarUrl} name={profile.name} size="xl" ring />
            <button
              type="button"
              onClick={onChangePhoto}
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              <Pen size={11} className="text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={onChangePhoto}
            className="text-xs text-primary-400 font-semibold mt-2 active:opacity-60"
          >
            Change Photo
          </button>
        </div>

        <div>
          <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider block mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} ${focusStyle}`}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider block mb-1.5">
            Branch
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className={`${inputClass} ${focusStyle}`}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider block mb-1.5">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`${inputClass} ${focusStyle}`}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
              <option key={y} value={y} style={{ background: '#0a0e1a' }}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider block mb-1.5">
            CGPA
          </label>
          <input
            type="text"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            className={`${inputClass} ${focusStyle}`}
            style={inputStyle}
            placeholder="e.g. 8.7"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider block mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={`${inputClass} ${focusStyle} resize-none`}
            style={inputStyle}
            placeholder="Tell something about yourself..."
          />
        </div>

        <Button variant="primary" fullWidth size="lg" onClick={handleSave} className="mt-1">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </ModalContainer>
  );
}

function SocialLinksModal({
  isOpen,
  onClose,
  links,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  links: SocialLink[];
  onSave: (links: SocialLink[]) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Record<string, string>>({
    instagram: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });

  useEffect(() => {
    const nextForm: Record<string, string> = {
      instagram: '',
      linkedin: '',
      github: '',
      portfolio: '',
    };

    links.forEach((link) => {
      if (nextForm[link.id] !== undefined) {
        nextForm[link.id] = link.handle || '';
      }
    });

    setForm(nextForm);
  }, [links, isOpen]);

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  const fields = [
    { id: 'instagram', platform: 'Instagram', placeholder: '@yourhandle or full URL' },
    { id: 'linkedin', platform: 'LinkedIn', placeholder: 'username or linkedin.com/in/yourname' },
    { id: 'github', platform: 'GitHub', placeholder: 'username or github.com/yourname' },
    { id: 'portfolio', platform: 'Portfolio', placeholder: 'yourportfolio.com or full URL' },
  ];

  const handleSave = async () => {
    const payload: SocialLink[] = fields.map((field) => {
      const normalized = normalizeSocialInput(field.id, form[field.id] || '');

      return {
        id: field.id,
        platform: field.platform,
        handle: normalized,
        url: normalized,
      };
    });

    await onSave(payload);
    onClose();
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} title="Social Links">
      <div className="flex flex-col gap-4 py-2">
        {fields.map((field) => {
          const Icon = SOCIAL_ICONS[field.id] || Globe;

          return (
            <div key={field.id}>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/35 uppercase tracking-wider mb-1.5">
                <Icon size={11} className={SOCIAL_COLORS[field.id] || 'text-white/70'} />
                {field.platform}
              </label>
              <input
                type="text"
                value={form[field.id] || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [field.id]: e.target.value,
                  }))
                }
                placeholder={field.placeholder}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none font-medium placeholder-white/22 transition-all focus:border-primary-500/50"
                style={inputStyle}
              />
            </div>
          );
        })}

        <Button variant="primary" fullWidth size="lg" onClick={handleSave} className="mt-1">
          {isSaving ? 'Saving...' : 'Save Links'}
        </Button>
      </div>
    </ModalContainer>
  );
}

function AboutUniSphereModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} title="About UniSphere">
      <div className="py-2">
        <div
          className="rounded-3xl p-4 mb-4"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 className="text-white font-bold text-lg mb-1">UniSphere</h3>
          <p className="text-white/45 text-sm mb-3">Version 1.0.0</p>
          <p className="text-white/65 text-sm leading-relaxed">
            UniSphere is your campus social platform for networking, clubs, posts, moderation, and
            student identity.
          </p>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{
            background: 'rgba(99,102,241,0.07)',
            border: '1px solid rgba(99,102,241,0.14)',
          }}
        >
          <p className="text-[11px] font-bold text-primary-300 uppercase tracking-wider mb-2">
            Included in this build
          </p>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <p>• Authentication and role system</p>
            <p>• Network connections and QR flow</p>
            <p>• Clubs, club admins, and club posts</p>
            <p>• Moderation and notifications</p>
            <p>• Profile and social identity system</p>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

function SavedPostCard({ post }: { post: Post }) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      {post.image && (
        <div className="h-32 overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4">
        <p className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-1.5">
          Saved Post
        </p>
        <h3 className="text-[14px] font-bold text-white leading-snug mb-1.5">{post.title}</h3>
        <p className="text-[12px] text-white/50 leading-relaxed line-clamp-3">
          {post.summary || post.content || 'No description available.'}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] text-white/35 font-medium">{post.authorName}</p>
          <p className="text-[10px] text-white/25 font-medium">{post.time}</p>
        </div>
      </div>
    </div>
  );
}

interface ProfilePageProps {
  onLogout?: () => void;
  onOpenMyPosts?: () => void;
  onOpenModeration?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenAdminClubs?: () => void;
  onOpenNotifications?: () => void;
}

const emptyProfile: User = {
  id: '',
  name: '',
  email: '',
  regNumber: '',
  branch: '',
  degree: 'B.Tech',
  year: '',
  role: 'student',
  bio: '',
  avatarUrl: '',
  cgpa: '',
  connections: 0,
  posts: 0,
  notes: 0,
  clubs: 0,
};

export default function ProfilePage({
  onLogout,
  onOpenMyPosts,
  onOpenModeration,
  onOpenAdminUsers,
  onOpenAdminClubs,
  onOpenNotifications,
}: ProfilePageProps) {
  const { user, refreshUser } = useAuth();
  const { myPosts, pendingPosts } = useModeration();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<User>(emptyProfile);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSocialLinks, setSavingSocialLinks] = useState(false);
  const [changingPhoto, setChangingPhoto] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [socialModal, setSocialModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'club_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const pendingCount = pendingPosts.filter(
    (p) => p.status === 'pending_club_review' || p.status === 'pending_admin_review'
  ).length;

  const myPostsCount = myPosts.length;

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [savedPostsData, profileData, linksData, connectionsData, achievementsData] = await Promise.all([
          getSavedPosts(),
          getUserProfile(),
          getSocialLinks(),
          getRecentConnections(),
          getAchievements(),
        ]);

        setSavedPosts(savedPostsData || []);

        if (profileData) {
          setProfile({ ...emptyProfile, ...profileData });
        } else if (user) {
          setProfile({ ...emptyProfile, ...user });
        }

        setSocialLinks(linksData || []);
        setRecentConnections(connectionsData || []);
        setAchievements(achievementsData || []);
      } catch (error) {
        console.error('Failed to load profile data:', error);
        if (user) {
          setProfile({ ...emptyProfile, ...user });
        }
        setSavedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleSaveProfile = async (data: Partial<User>) => {
    setSavingProfile(true);
    try {
      const result = await updateUserProfile(data);

      if (result.error) {
        alert(result.error);
        return;
      }

      if (result.user) {
        setProfile({ ...emptyProfile, ...result.user });
      }

      await refreshUser();
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSocialLinks = async (links: SocialLink[]) => {
    setSavingSocialLinks(true);
    try {
      const cleanedLinks = links.map((link) => ({
        ...link,
        handle: link.handle.trim(),
        url: link.url.trim(),
      }));

      const result = await updateSocialLinks(cleanedLinks);

      if (result.error) {
        alert(result.error);
        return;
      }

      if (result.links) {
        setSocialLinks(result.links);
      } else {
        setSocialLinks(cleanedLinks);
      }
    } finally {
      setSavingSocialLinks(false);
    }
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      event.target.value = '';
      return;
    }

    const maxSizeMb = 2;
    if (file.size > maxSizeMb * 1024 * 1024) {
      alert('Please choose an image smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    setChangingPhoto(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      const result = await updateUserProfile({ avatarUrl: base64 });

      if (result.error) {
        alert(result.error);
        return;
      }

      if (result.user) {
        setProfile({ ...emptyProfile, ...result.user });
      }

      await refreshUser();
    } catch (error) {
      console.error('Failed to update profile photo:', error);
      alert('Failed to update photo. Please try again.');
    } finally {
      setChangingPhoto(false);
      event.target.value = '';
    }
  };

  const handleCopyReg = async () => {
    try {
      await navigator.clipboard.writeText(profile.regNumber || '');
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `${profile.name} - ${profile.branch} | ${profile.email}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="content-area fade-in flex items-center justify-center min-h-[60vh]">
        <div className="text-white/60 text-sm font-medium">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="content-area fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelected}
        className="hidden"
      />

      <div className="relative px-5 pt-14 pb-2">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/8 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <UserIcon size={13} className="text-primary-400" />
              <span className="text-micro text-primary-400 uppercase tracking-widest">
                My Profile
              </span>
            </div>
            <h1 className="text-display text-white" style={{ letterSpacing: '-0.03em' }}>
              Profile
            </h1>
          </div>
          <button
            onClick={() => setEditModal(true)}
            className="p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      <div className="px-4 mb-5">
        <div
          className="relative rounded-4xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/12 via-transparent to-cyan-600/5 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />

          <div className="relative flex flex-col items-center text-center px-5 pt-7 pb-5">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/25 to-cyan-500/15 blur-2xl scale-125" />
              <Avatar src={profile.avatarUrl} name={profile.name} size="2xl" ring />
              <button
                onClick={handleChoosePhoto}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                <Pen size={11} className="text-white" />
              </button>
            </div>

            <h2 className="text-[22px] font-extrabold text-white mb-0.5 tracking-tight">
              {profile.name || 'Student'}
            </h2>
            <p className="text-[13px] text-white/45 font-medium mb-1.5">
              {profile.branch || 'Branch not set'}
            </p>

            {profile.bio && (
              <p className="text-[12px] text-white/35 font-medium leading-relaxed mb-3 max-w-[260px]">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap justify-center mb-5">
              <TagBadge label={profile.degree || 'B.Tech'} variant="blue" />
              <TagBadge label={profile.year || 'Year not set'} variant="violet" />
              <TagBadge label={`CGPA ${profile.cgpa || '-'}`} variant="emerald" />
            </div>

            <div className="flex gap-2.5 w-full mb-5">
              <button
                onClick={() => setEditModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                }}
              >
                <Edit3 size={14} />
                Edit Profile
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold text-white/60 transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            {changingPhoto && (
              <p className="text-[11px] text-primary-300 mb-3 font-semibold">Updating photo...</p>
            )}

            <div
              className="grid grid-cols-4 gap-0 w-full pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              {[
                { label: 'Connections', value: String(profile.connections ?? 0), clickable: false },
                { label: 'Clubs', value: String(profile.clubs ?? 0), clickable: false },
                { label: 'Posts', value: String(profile.posts ?? 0), clickable: true },
                { label: 'Notes', value: String(profile.notes ?? 0), clickable: false },
              ].map((s, i) =>
                s.clickable ? (
                  <button
                    key={s.label}
                    onClick={onOpenMyPosts}
                    className={`text-center py-1 ${i < 3 ? 'border-r' : ''}`}
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <p
                      className="text-base font-extrabold leading-none"
                      style={{
                        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[9px] text-white/30 font-semibold mt-0.5">{s.label}</p>
                  </button>
                ) : (
                  <div
                    key={s.label}
                    className={`text-center py-1 ${i < 3 ? 'border-r' : ''}`}
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <p
                      className="text-base font-extrabold leading-none"
                      style={{
                        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[9px] text-white/30 font-semibold mt-0.5">{s.label}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-5">
        <SectionHeader title="Saved Posts" />
        {savedPosts.length === 0 ? (
          <div
            className="rounded-3xl px-4 py-5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-sm font-bold text-white/45">No saved posts yet</p>
            <p className="text-[12px] text-white/25 mt-1">Save posts from the feed and they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {savedPosts.map((post) => (
              <SavedPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mb-5">
        <SectionHeader title="Student Information" />
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {[
            { icon: Hash, label: 'Registration Number', value: profile.regNumber || '-' },
            { icon: GraduationCap, label: 'Branch', value: profile.branch || '-' },
            { icon: BookOpen, label: 'Degree', value: profile.degree || '-' },
            { icon: Award, label: 'Year', value: profile.year || '-' },
            { icon: Mail, label: 'University Email', value: profile.email || '-' },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={i < arr.length - 1 ? 'border-b' : ''}
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <InfoRow icon={row.icon} label={row.label} value={row.value} />
            </div>
          ))}

          <div
            className="flex items-center justify-end px-4 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <button
              onClick={handleCopyReg}
              className="flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
              style={{ color: copied ? '#34d399' : 'rgba(129,140,248,1)' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Reg. No.'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2 px-5 mb-3.5">
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          />
          <span className="text-sm font-bold text-white tracking-tight">Achievements</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 pl-5 pr-3" style={{ scrollbarWidth: 'none' }}>
          {achievements.length === 0 ? (
            <div className="px-5 py-3 text-sm text-white/40">No achievements yet.</div>
          ) : (
            achievements.map((ach) => (
              <div
                key={ach.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[84px] rounded-3xl px-3 py-3.5 transition-transform active:scale-95"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${ach.bgFrom} ${ach.bgTo} flex items-center justify-center`}
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Award size={17} className={ach.color} />
                </div>
                <p className="text-[10px] font-bold text-white/60 text-center leading-tight whitespace-pre-line">
                  {ach.title}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-4 mb-5">
        <SectionHeader title="Social Links" action="Edit" onAction={() => setSocialModal(true)} />
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {socialLinks.filter((link) => link.handle?.trim()).length === 0 ? (
            <div className="px-4 py-4 text-sm text-white/40">No social links added yet.</div>
          ) : (
            socialLinks
              .filter((link) => link.handle?.trim())
              .map((link, i, arr) => {
                const Icon = SOCIAL_ICONS[link.id] || Globe;
                return (
                  <a
                    key={link.id}
                    href={link.url || link.handle}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7 ${
                      i < arr.length - 1 ? 'border-b' : ''
                    }`}
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: SOCIAL_BG[link.id] || 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Icon size={15} className={SOCIAL_COLORS[link.id] || 'text-white/70'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                        {link.platform}
                      </p>
                      <p className="text-[13px] text-white/75 truncate font-medium mt-0.5">
                        {getSocialDisplayValue(link.id, link.handle || link.url || '')}
                      </p>
                    </div>
                    <ChevronRight
                      size={13}
                      strokeWidth={2.5}
                      className="text-white/18 flex-shrink-0"
                    />
                  </a>
                );
              })
          )}
        </div>
      </div>

      <div className="px-4 mb-4">
        <p className="text-[10px] font-bold text-white/22 uppercase tracking-[0.12em] mb-2.5 ml-1">
          Content
        </p>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={onOpenMyPosts}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <FileEdit size={15} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">My Posts</p>
              <p className="text-[11px] text-white/30">Track your submission status</p>
            </div>
            {myPostsCount > 0 && (
              <div
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-400"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
              >
                {myPostsCount}
              </div>
            )}
            <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
          </button>

          {isAdmin && (
            <button
              onClick={onOpenModeration}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7 ${
                isSuperAdmin ? 'border-b' : ''
              }`}
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <Shield size={15} className="text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-white">Moderation</p>
                <p className="text-[11px] text-white/30">Review and approve pending posts</p>
              </div>
              {pendingCount > 0 && (
                <div
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                  {pendingCount}
                </div>
              )}
              <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
            </button>
          )}

          {isSuperAdmin && (
            <>
              <button
                onClick={onOpenAdminUsers}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
                >
                  <Users size={15} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white">Admin Users</p>
                  <p className="text-[11px] text-white/30">Promote students and manage platform roles</p>
                </div>
                <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
              </button>

              <button
                onClick={onOpenAdminClubs}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <Building2 size={15} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white">Admin Clubs</p>
                  <p className="text-[11px] text-white/30">Create clubs and assign club admins</p>
                </div>
                <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 mb-4">
        <p className="text-[10px] font-bold text-white/22 uppercase tracking-[0.12em] mb-2.5 ml-1">
          Preferences
        </p>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={onOpenNotifications}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Bell size={15} className="text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">Notifications</p>
              <p className="text-[11px] text-white/30">Manage alerts & updates</p>
            </div>
            <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
          </button>
        </div>
      </div>

      <div className="px-4 mb-4">
        <p className="text-[10px] font-bold text-white/22 uppercase tracking-[0.12em] mb-2.5 ml-1">
          Support
        </p>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={() => setAboutModal(true)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <BookOpen size={15} className="text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">About UniSphere</p>
              <p className="text-[11px] text-white/30">Version 1.0.0</p>
            </div>
            <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
          </button>
        </div>
      </div>

      <div className="px-4 mb-8">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-rose-400 transition-all active:scale-95"
          style={{
            background: 'rgba(244,63,94,0.06)',
            border: '1px solid rgba(244,63,94,0.18)',
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>

      <EditProfileModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onChangePhoto={handleChoosePhoto}
        isSaving={savingProfile}
      />

      <SocialLinksModal
        isOpen={socialModal}
        onClose={() => setSocialModal(false)}
        links={socialLinks}
        onSave={handleSaveSocialLinks}
        isSaving={savingSocialLinks}
      />

      <AboutUniSphereModal isOpen={aboutModal} onClose={() => setAboutModal(false)} />
    </div>
  );
}
