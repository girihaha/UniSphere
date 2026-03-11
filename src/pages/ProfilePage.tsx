import { useState } from 'react';
import { Github, Linkedin, Globe, Instagram, Settings, ChevronRight, Pen, LogOut, Bell, Shield, Moon, HelpCircle, BookOpen, Award, User, Share2, Copy, Check, GraduationCap, Mail, Hash, CreditCard as Edit3, File as FileEdit } from 'lucide-react';
import Avatar from '../components/Avatar';
import TagBadge from '../components/TagBadge';
import Button from '../components/Button';
import ModalContainer from '../components/ModalContainer';
import { studentProfile, socialLinks, recentConnections } from '../data/profile';
import { useAuth } from '../context/AuthContext';
import { useModeration } from '../context/ModerationContext';

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

const achievements = [
  { id: '1', label: 'Hackathon\nWinner',  color: 'text-amber-400',   bg: 'from-amber-500/15 to-amber-600/5',   icon: Award },
  { id: '2', label: "Dean's\nList",       color: 'text-blue-400',    bg: 'from-blue-500/15 to-blue-600/5',     icon: BookOpen },
  { id: '3', label: 'Club\nLeader',       color: 'text-cyan-400',    bg: 'from-cyan-500/15 to-cyan-600/5',     icon: Award },
  { id: '4', label: 'Top\nContributor',   color: 'text-emerald-400', bg: 'from-emerald-500/15 to-emerald-600/5', icon: User },
];

const settingsGroups = [
  {
    title: 'Preferences',
    items: [
      { icon: Bell,       label: 'Notifications',   desc: 'Manage alerts & updates' },
      { icon: Moon,       label: 'Appearance',       desc: 'Dark mode and themes' },
      { icon: Shield,     label: 'Privacy',          desc: 'Control who sees your profile' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & FAQ',       desc: 'Get answers to common questions' },
      { icon: BookOpen,   label: 'About Unisphere',  desc: 'Version 1.0.0' },
    ],
  },
];

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
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

function InfoRow({ icon: Icon, label, value }: { icon: React.FC<{ size?: number; className?: string }>; label: string; value: string }) {
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
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: typeof studentProfile;
  onSave: (data: Partial<typeof studentProfile>) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [branch, setBranch] = useState(profile.branch);
  const [year, setYear] = useState(profile.year);
  const [bio, setBio] = useState(profile.bio);

  const handleSave = () => {
    onSave({ name, branch, year, bio });
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
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              <Pen size={11} className="text-white" />
            </button>
          </div>
          <button className="text-xs text-primary-400 font-semibold mt-2 active:opacity-60">
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
          Save Changes
        </Button>
      </div>
    </ModalContainer>
  );
}

function SocialLinksModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} title="Social Links">
      <div className="flex flex-col gap-4 py-2">
        {socialLinks.map((link) => {
          const Icon = SOCIAL_ICONS[link.id] || Globe;
          return (
            <div key={link.id}>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/35 uppercase tracking-wider mb-1.5">
                <Icon size={11} className={SOCIAL_COLORS[link.id]} />
                {link.platform}
              </label>
              <input
                type="text"
                defaultValue={link.handle}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none font-medium placeholder-white/22 transition-all focus:border-primary-500/50"
                style={inputStyle}
              />
            </div>
          );
        })}
        <Button variant="primary" fullWidth size="lg" onClick={onClose} className="mt-1">
          Save Links
        </Button>
      </div>
    </ModalContainer>
  );
}

interface ProfilePageProps {
  onLogout?: () => void;
  onOpenMyPosts?: () => void;
  onOpenModeration?: () => void;
}

export default function ProfilePage({ onLogout, onOpenMyPosts, onOpenModeration }: ProfilePageProps) {
  const { user } = useAuth();
  const { myPosts, pendingPosts } = useModeration();
  const [profile, setProfile] = useState(studentProfile);
  const [editModal, setEditModal] = useState(false);
  const [socialModal, setSocialModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'club_admin';
  const pendingCount = pendingPosts.filter((p) => p.status === 'pending').length;
  const myPostsCount = myPosts.length;

  const handleSaveProfile = (data: Partial<typeof studentProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const handleCopyReg = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    handleCopyReg();
  };

  return (
    <div className="content-area fade-in">
      <div className="relative px-5 pt-14 pb-2">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/8 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <User size={13} className="text-primary-400" />
              <span className="text-micro text-primary-400 uppercase tracking-widest">My Profile</span>
            </div>
            <h1 className="text-display text-white" style={{ letterSpacing: '-0.03em' }}>Profile</h1>
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

      {/* Profile Header Card */}
      <div className="px-4 mb-5">
        <div
          className="relative rounded-4xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
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
              <Avatar
                src={profile.avatarUrl}
                name={profile.name}
                size="2xl"
                ring
              />
              <button
                onClick={() => setEditModal(true)}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                <Pen size={11} className="text-white" />
              </button>
            </div>

            <h2 className="text-[22px] font-extrabold text-white mb-0.5 tracking-tight">
              {profile.name}
            </h2>
            <p className="text-[13px] text-white/45 font-medium mb-1.5">{profile.branch}</p>

            {profile.bio && (
              <p className="text-[12px] text-white/35 font-medium leading-relaxed mb-3 max-w-[260px]">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap justify-center mb-5">
              <TagBadge label={profile.degree} variant="blue" />
              <TagBadge label={profile.year} variant="violet" />
              <TagBadge label={`CGPA ${profile.cgpa}`} variant="emerald" />
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

            <div
              className="grid grid-cols-4 gap-0 w-full pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              {[
                { label: 'Connections', value: String(profile.connections) },
                { label: 'Clubs',       value: String(profile.clubs) },
                { label: 'Posts',       value: String(profile.posts) },
                { label: 'Notes',       value: String(profile.notes) },
              ].map((s, i) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="px-4 mb-5">
        <SectionHeader title="Student Information" />
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {[
            { icon: Hash,          label: 'Registration Number', value: profile.regNumber },
            { icon: GraduationCap, label: 'Branch',              value: profile.branch },
            { icon: BookOpen,      label: 'Degree',              value: profile.degree },
            { icon: Award,         label: 'Year',                value: profile.year },
            { icon: Mail,          label: 'University Email',    value: profile.email },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={i < arr.length - 1 ? 'border-b' : ''}
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <InfoRow icon={row.icon} label={row.label} value={row.value} />
            </div>
          ))}

          <div className="flex items-center justify-end px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
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

      {/* Achievements */}
      <div className="mb-5">
        <div className="flex items-center gap-2 px-5 mb-3.5">
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          />
          <span className="text-sm font-bold text-white tracking-tight">Achievements</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 pl-5 pr-3" style={{ scrollbarWidth: 'none' }}>
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex-shrink-0 flex flex-col items-center gap-2 min-w-[84px] rounded-3xl px-3 py-3.5 transition-transform active:scale-95`}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${ach.bg} flex items-center justify-center`} style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <ach.icon size={17} className={ach.color} />
              </div>
              <p className="text-[10px] font-bold text-white/60 text-center leading-tight whitespace-pre-line">{ach.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="px-4 mb-5">
        <SectionHeader title="Social Links" action="Edit" onAction={() => setSocialModal(true)} />
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {socialLinks.map((link, i) => {
            const Icon = SOCIAL_ICONS[link.id] || Globe;
            return (
              <button
                key={link.id}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7 ${i < socialLinks.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: SOCIAL_BG[link.id], border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Icon size={15} className={SOCIAL_COLORS[link.id]} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{link.platform}</p>
                  <p className="text-[13px] text-white/75 truncate font-medium mt-0.5">{link.handle}</p>
                </div>
                <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Connections */}
      <div className="px-4 mb-5">
        <SectionHeader
          title="Recent Connections"
          action={`View all ${profile.connections}`}
        />
        <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {recentConnections.map((c) => (
            <button
              key={c.id}
              className="flex-shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <Avatar src={c.avatarUrl} name={c.name} size="lg" ring />
              <div className="text-center">
                <p className="text-[11px] font-bold text-white leading-tight">{c.name.split(' ')[0]}</p>
                <p className="text-[10px] text-white/30 font-medium">{c.branch}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick access: My Posts + Moderation */}
      <div className="px-4 mb-4">
        <p className="text-[10px] font-bold text-white/22 uppercase tracking-[0.12em] mb-2.5 ml-1">
          Content
        </p>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
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
              <div className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-400" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                {myPostsCount}
              </div>
            )}
            <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
          </button>
          {isAdmin && (
            <button
              onClick={onOpenModeration}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7"
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
                <div className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                  {pendingCount}
                </div>
              )}
              <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="px-4 mb-4">
          <p className="text-[10px] font-bold text-white/22 uppercase tracking-[0.12em] mb-2.5 ml-1">
            {group.title}
          </p>
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {group.items.map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors active:bg-white/7 ${i < group.items.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <item.icon size={15} className="text-white/50" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white">{item.label}</p>
                  <p className="text-[11px] text-white/30">{item.desc}</p>
                </div>
                <ChevronRight size={13} strokeWidth={2.5} className="text-white/18 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Social Links Modal */}
      <SocialLinksModal
        isOpen={socialModal}
        onClose={() => setSocialModal(false)}
      />
    </div>
  );
}
