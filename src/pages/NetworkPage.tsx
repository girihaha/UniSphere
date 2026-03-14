import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  QrCode,
  ChevronRight,
  Users,
  MessageSquare,
  Instagram,
  Linkedin,
  Github,
  Globe,
  Check,
  X,
  Bell,
  Search,
  UserCheck,
  UserPlus,
  Send,
  ScanLine,
  Copy,
  Camera,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { ConnectionCardSkeleton } from '../components/Skeleton';
import NotificationBell from '../components/NotificationBell';
import Avatar from '../components/Avatar';
import TagBadge from '../components/TagBadge';
import Button from '../components/Button';
import {
  getConnections,
  getConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  sendConnectionRequest,
  getNetworkNotes,
  createNetworkNote,
  getUserProfileById,
} from '../services/networkService';
import { useAuth } from '../context/AuthContext';
import type { Connection, ConnectionRequest, NetworkNote } from '../types';

const QR_PATTERN = [0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 24, 27, 28, 31, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48];
const SCANNER_ELEMENT_ID = 'unisphere-qr-reader';

type RelationshipStatus = 'connected' | 'request_sent' | 'you' | 'none';

type LookupProfile = {
  id: string;
  name: string;
  branch: string;
  degree: string;
  year: string;
  avatarUrl?: string;
  bio?: string;
  mutual?: number;
  relationshipStatus?: RelationshipStatus;
  posts?: number;
  clubs?: number;
  connectionsCount?: number;
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

type ViewProfile = {
  id: string;
  name: string;
  branch: string;
  degree: string;
  year: string;
  avatarUrl?: string;
  bio?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  mutual?: number;
  relationshipStatus: RelationshipStatus;
  posts?: number;
  clubs?: number;
  connectionsCount?: number;
};

type MessageTarget = {
  id: string;
  name: string;
};

function normalizeSocialUrl(label: string, value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return raw;
  }

  if (label === 'Instagram') {
    const cleaned = raw
      .replace(/^@+/, '')
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^instagram\.com\//i, '')
      .replace(/\/+$/, '');

    return cleaned ? `https://instagram.com/${cleaned}` : null;
  }

  if (label === 'LinkedIn') {
    const cleaned = raw
      .replace(/^https?:\/\/(www\.)?linkedin\.com\//i, '')
      .replace(/^linkedin\.com\//i, '')
      .replace(/^in\//i, '')
      .replace(/\/+$/, '');

    return cleaned ? `https://linkedin.com/in/${cleaned}` : null;
  }

  if (label === 'GitHub') {
    const cleaned = raw
      .replace(/^@+/, '')
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^github\.com\//i, '')
      .replace(/\/+$/, '');

    return cleaned ? `https://github.com/${cleaned}` : null;
  }

  if (label === 'Portfolio') {
    return `https://${raw.replace(/^https?:\/\//i, '')}`;
  }

  return null;
}

function getSocialDisplayValue(label: string, value: string): string {
  const raw = value.trim();
  if (!raw) return '';

  const normalized = normalizeSocialUrl(label, raw);
  if (!normalized) return raw;

  if (label === 'Instagram') {
    const cleaned = normalized
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/\/+$/, '');
    return cleaned ? `@${cleaned}` : raw;
  }

  if (label === 'LinkedIn') {
    const cleaned = normalized
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
      .replace(/\/+$/, '');
    return cleaned ? `in/${cleaned}` : raw;
  }

  if (label === 'GitHub') {
    return normalized
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/\/+$/, '');
  }

  if (label === 'Portfolio') {
    return normalized.replace(/^https?:\/\//i, '');
  }

  return raw;
}

function getRelationshipBadgeStyles(status: RelationshipStatus) {
  switch (status) {
    case 'connected':
      return {
        text: 'Connected',
        background: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.22)',
        color: '#34d399',
      };
    case 'request_sent':
      return {
        text: 'Request Sent',
        background: 'rgba(99,102,241,0.12)',
        border: '1px solid rgba(99,102,241,0.22)',
        color: '#818cf8',
      };
    case 'you':
      return {
        text: 'You',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.8)',
      };
    case 'none':
    default:
      return {
        text: 'Not Connected',
        background: 'rgba(244,63,94,0.10)',
        border: '1px solid rgba(244,63,94,0.18)',
        color: '#fb7185',
      };
  }
}

function QRGrid({ size = 7, small = false }: { size?: number; small?: boolean }) {
  const cellSize = small ? 'w-[6px] h-[6px]' : 'w-[26px] h-[26px]';

  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {Array(size * size)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`${cellSize} rounded-[2px] ${QR_PATTERN.includes(i) ? 'bg-primary-400' : 'bg-white/8'}`}
          />
        ))}
    </div>
  );
}

function InlineModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{
        background: 'rgba(5, 8, 18, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-[32px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(12,16,30,0.98) 0%, rgba(10,14,26,0.98) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
          maxHeight: 'calc(100dvh - 12px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 pt-4 pb-4"
          style={{
            background: 'rgba(10,14,26,0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="w-8" />
          <h2 className="text-base font-extrabold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/55 hover:text-white transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="px-4 py-4 overflow-y-auto"
          style={{
            maxHeight: 'calc(100dvh - 72px)',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

function FeedbackToast({
  visible,
  type,
  message,
}: {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
}) {
  return (
    <div
      className="fixed top-20 left-1/2 z-[10000] flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-white"
      style={{
        transform: `translateX(-50%) translateY(${visible ? '0' : '-10px'})`,
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s ease',
        background: 'rgba(16,20,36,0.96)',
        border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        pointerEvents: 'none',
      }}
    >
      {type === 'success' ? (
        <CheckCircle2 size={14} className="text-emerald-400" />
      ) : (
        <AlertCircle size={14} className="text-rose-400" />
      )}
      <span>{message}</span>
    </div>
  );
}

function SocialLink({
  icon,
  label,
  value,
  onInvalidLink,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onInvalidLink?: (message: string) => void;
}) {
  const url = normalizeSocialUrl(label, value);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!url) {
      e.preventDefault();
      onInvalidLink?.(`${label} link is invalid`);
    }
  };

  return (
    <a
      href={url ?? '#'}
      target={url ? '_blank' : undefined}
      rel={url ? 'noreferrer noopener' : undefined}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl transition-all active:scale-95"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onClick={handleClick}
    >
      <span className="text-primary-400 flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{label}</p>
        <p className="text-[11px] font-semibold text-white/70 truncate">
          {getSocialDisplayValue(label, value)}
        </p>
      </div>
      <ChevronRight size={11} className="text-white/20 flex-shrink-0" />
    </a>
  );
}

function ConnectionCard({
  conn,
  expanded,
  onToggle,
  onViewProfile,
  onMessage,
  onInvalidLink,
}: {
  conn: Connection;
  expanded: boolean;
  onToggle: () => void;
  onViewProfile: () => void;
  onMessage: () => void;
  onInvalidLink: (message: string) => void;
}) {
  const hasSocials = conn.instagram || conn.linkedin || conn.github || conn.portfolio;

  return (
    <div
      className="rounded-3xl overflow-hidden transition-all duration-300"
      style={{
        background: expanded
          ? 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(255,255,255,0.04) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        border: expanded
          ? '1px solid rgba(99,102,241,0.22)'
          : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <button
        className="w-full flex items-center gap-3.5 p-4 text-left active:bg-white/4 transition-colors"
        onClick={onToggle}
      >
        <Avatar src={conn.avatar} name={conn.name} size="md" status={conn.online ? 'online' : null} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white tracking-tight truncate">{conn.name}</p>
          <p className="text-[11px] text-white/40 truncate font-medium">{conn.branch}</p>
          <div className="flex items-center gap-2 mt-1">
            <TagBadge label={conn.year} variant="blue" size="sm" />
            <span className="text-[10px] text-white/25 font-medium">{conn.mutual} mutual</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasSocials && !expanded && (
            <div className="flex gap-1">
              {conn.instagram && <Instagram size={10} className="text-white/20" />}
              {conn.linkedin && <Linkedin size={10} className="text-white/20" />}
              {conn.github && <Github size={10} className="text-white/20" />}
            </div>
          )}
          <ChevronRight
            size={14}
            strokeWidth={2.5}
            className={`text-white/20 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? '300px' : '0px' }}
      >
        <div className="px-4 pb-4 pt-1">
          {hasSocials && (
            <div className="flex flex-col gap-2 mb-3">
              {conn.instagram && (
                <SocialLink
                  icon={<Instagram size={13} />}
                  label="Instagram"
                  value={conn.instagram}
                  onInvalidLink={onInvalidLink}
                />
              )}
              {conn.linkedin && (
                <SocialLink
                  icon={<Linkedin size={13} />}
                  label="LinkedIn"
                  value={conn.linkedin}
                  onInvalidLink={onInvalidLink}
                />
              )}
              {conn.github && (
                <SocialLink
                  icon={<Github size={13} />}
                  label="GitHub"
                  value={conn.github}
                  onInvalidLink={onInvalidLink}
                />
              )}
              {conn.portfolio && (
                <SocialLink
                  icon={<Globe size={13} />}
                  label="Portfolio"
                  value={conn.portfolio}
                  onInvalidLink={onInvalidLink}
                />
              )}
            </div>
          )}
          <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Button variant="primary" size="sm" icon={<MessageSquare size={12} />} className="flex-1" onClick={onMessage}>
              Message
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<UserCheck size={12} />}
              className="flex-1"
              onClick={onViewProfile}
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({
  req,
  onAccept,
  onDecline,
}: {
  req: ConnectionRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={req.avatar} name={req.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white tracking-tight">{req.name}</p>
          <p className="text-[11px] text-white/40 font-medium">
            {req.branch} · {req.year}
          </p>
          <p className="text-[10px] text-primary-400 font-semibold mt-0.5">
            {req.mutual} mutual connections
          </p>
        </div>
        <span className="text-[10px] text-white/25 font-medium flex-shrink-0">{req.time}</span>
      </div>

      {req.message && (
        <p
          className="text-[11px] text-white/50 italic mb-3 px-3 py-2 rounded-xl leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          "{req.message}"
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          <Check size={13} strokeWidth={2.5} />
          Accept
        </button>
        <button
          onClick={onDecline}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white/50 transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <X size={13} strokeWidth={2.5} />
          Decline
        </button>
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: NetworkNote }) {
  return (
    <div
      className="flex-shrink-0 w-[220px] p-3.5 rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Avatar src={note.avatar} name={note.authorName} size="xs" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-white truncate">{note.authorName.split(' ')[0]}</p>
          <p className="text-[9px] text-white/30 font-medium">{note.authorBranch}</p>
        </div>
      </div>
      <p className="text-[12px] text-white/65 leading-relaxed font-medium mb-2">{note.text}</p>
      <p className="text-[9px] text-white/25 font-semibold">{note.time}</p>
    </div>
  );
}

export default function NetworkPage({ onOpenNotifications }: { onOpenNotifications?: () => void }) {
  const { user, refreshUser } = useAuth();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerStartedRef = useRef(false);

  const [qrModal, setQrModal] = useState(false);
  const [lookupModal, setLookupModal] = useState(false);
  const [scannerModal, setScannerModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [messageModal, setMessageModal] = useState(false);

  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupProfile, setLookupProfile] = useState<LookupProfile | null>(null);
  const [lookupError, setLookupError] = useState('');

  const [selectedProfile, setSelectedProfile] = useState<ViewProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [messageTarget, setMessageTarget] = useState<MessageTarget | null>(null);

  const [scannerError, setScannerError] = useState('');
  const [scannerStatus, setScannerStatus] = useState('Starting camera...');
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrImageFailed, setQrImageFailed] = useState(false);
  const [sharingProfile, setSharingProfile] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [notes, setNotes] = useState<NetworkNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [postingNote, setPostingNote] = useState(false);
  const [showRequests, setShowRequests] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sendingConnectionId, setSendingConnectionId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);

    window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  const clearLookupState = () => {
    setLookupCode('');
    setLookupProfile(null);
    setLookupLoading(false);
    setLookupError('');
  };

  const closeProfileModal = () => {
    setProfileModal(false);
    setSelectedProfile(null);
    setProfileLoading(false);
  };

  const closeMessageModal = () => {
    setMessageModal(false);
    setMessageTarget(null);
  };

  const openMessagePlaceholder = (target: MessageTarget) => {
    setMessageTarget(target);
    setMessageModal(true);
  };

  const loadNetworkData = async () => {
    setLoading(true);

    try {
      const [requestsData, connectionsData, notesData] = await Promise.all([
        getConnectionRequests(),
        getConnections(),
        getNetworkNotes(),
      ]);

      setRequests(requestsData);
      setConnections(connectionsData);
      setNotes(notesData);
      await refreshUser();
    } catch (error) {
      console.error('Failed to load network data:', error);
      setRequests([]);
      setConnections([]);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerStartedRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }

    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (error) {
        console.error('Failed to clear scanner:', error);
      }
    }

    scannerStartedRef.current = false;
    scannerRef.current = null;
  };

  const parseScannedValue = (value: string) => {
    const trimmed = value.trim();

    if (trimmed.startsWith('unisphere-profile:')) {
      return trimmed.replace('unisphere-profile:', '').trim();
    }

    return trimmed;
  };

  const openLookupWithCode = async (code: string) => {
    const cleanedCode = code.trim();

    setScannerModal(false);
    setLookupModal(true);
    setLookupCode(cleanedCode);
    setLookupProfile(null);
    setLookupError('');

    if (!cleanedCode) {
      setLookupError('Invalid profile code');
      return;
    }

    if (user?.id && cleanedCode === user.id) {
      setLookupError('This is your own profile code');
      showToast('error', 'You scanned your own QR');
      return;
    }

    setLookupLoading(true);
    const profile = await getUserProfileById(cleanedCode);
    setLookupLoading(false);

    if (!profile) {
      setLookupProfile(null);
      setLookupError('Profile not found');
      showToast('error', 'Profile not found');
      return;
    }

    if (user?.id && profile.id === user.id) {
      setLookupProfile(profile);
      setLookupError('This is your own profile');
      showToast('error', 'You cannot connect with yourself');
      return;
    }

    setLookupProfile(profile);
  };

  useEffect(() => {
    if (!scannerModal) {
      stopScanner();
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      try {
        setScannerError('');
        setScannerStatus('Starting camera...');

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (cancelled) return;

            const code = parseScannedValue(decodedText);
            setScannerStatus('QR detected');
            await stopScanner();
            await openLookupWithCode(code);
          },
          () => {}
        );

        scannerStartedRef.current = true;
        setScannerStatus('Point camera at a UniSphere QR');
      } catch (error) {
        console.error('Scanner start failed:', error);
        setScannerError('Camera access failed. You can still enter the profile code manually.');
        setScannerStatus('');
      }
    };

    const timeout = window.setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      stopScanner();
    };
  }, [scannerModal, user?.id]);

  const filteredConnections = connections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.branch.toLowerCase().includes(search.toLowerCase())
  );

  const handleAccept = async (id: string) => {
    const result = await acceptConnectionRequest(id);

    if (result.success) {
      showToast('success', result.message || 'Request accepted');
      await loadNetworkData();
      return;
    }

    showToast('error', result.error || 'Failed to accept request');
  };

  const handleDecline = async (id: string) => {
    const result = await rejectConnectionRequest(id);

    if (result.success) {
      showToast('success', result.message || 'Request rejected');
      await loadNetworkData();
      return;
    }

    showToast('error', result.error || 'Failed to reject request');
  };

  const handleConnect = async (id: string) => {
    if (!user?.id) {
      showToast('error', 'User session missing. Please log in again.');
      return;
    }

    if (id === user.id) {
      showToast('error', 'You cannot connect with yourself');
      return;
    }

    setSendingConnectionId(id);
    const result = await sendConnectionRequest(id);
    setSendingConnectionId(null);

    if (result.success) {
      showToast('success', result.message || 'Connection request sent');
      await loadNetworkData();
      return;
    }

    showToast('error', result.error || 'Failed to send request');
  };

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;

    setPostingNote(true);
    const result = await createNetworkNote(newNote);
    setPostingNote(false);

    if (result.success) {
      setNewNote('');
      showToast('success', result.message || 'Note posted');
      await loadNetworkData();
      return;
    }

    showToast('error', result.error || 'Failed to post note');
  };

  const handleLookupProfile = async () => {
    const cleanedCode = lookupCode.trim();

    if (!cleanedCode) {
      setLookupError('Please enter a profile code');
      showToast('error', 'Please enter a profile code');
      return;
    }

    setLookupError('');
    setLookupLoading(true);
    setLookupProfile(null);

    if (user?.id && cleanedCode === user.id) {
      setLookupLoading(false);
      setLookupError('This is your own profile code');
      showToast('error', 'You cannot connect with yourself');
      return;
    }

    const profile = await getUserProfileById(cleanedCode);
    setLookupLoading(false);

    if (!profile) {
      setLookupError('Profile not found');
      showToast('error', 'Profile not found');
      return;
    }

    if (user?.id && profile.id === user.id) {
      setLookupProfile(profile);
      setLookupError('This is your own profile');
      showToast('error', 'You cannot connect with yourself');
      return;
    }

    setLookupProfile(profile);
  };

  const handleConnectLookupProfile = async () => {
    if (!user?.id) {
      showToast('error', 'User session missing. Please log in again.');
      return;
    }

    if (!lookupProfile?.id) {
      showToast('error', 'No profile selected');
      return;
    }

    if (lookupProfile.id === user.id) {
      showToast('error', 'You cannot connect with yourself');
      return;
    }

    setSendingConnectionId(lookupProfile.id);
    const result = await sendConnectionRequest(lookupProfile.id);
    setSendingConnectionId(null);

    if (result.success) {
      showToast('success', result.message || 'Connection request sent');
      await loadNetworkData();
      setLookupModal(false);
      clearLookupState();
      return;
    }

    showToast('error', result.error || 'Failed to send request');
  };

  const handleOpenConnectionProfile = async (conn: Connection) => {
    setProfileModal(true);
    setProfileLoading(true);

    const profile = await getUserProfileById(conn.id);

    if (!profile) {
      setProfileLoading(false);
      setProfileModal(false);
      showToast('error', 'Failed to load profile');
      return;
    }

    setSelectedProfile({
      id: profile.id,
      name: profile.name,
      branch: profile.branch,
      degree: profile.degree,
      year: profile.year,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      instagram: profile.instagram || conn.instagram,
      linkedin: profile.linkedin || conn.linkedin,
      github: profile.github || conn.github,
      portfolio: profile.portfolio || conn.portfolio,
      mutual: profile.mutual ?? conn.mutual ?? 0,
      relationshipStatus: profile.relationshipStatus ?? (conn.id === user?.id ? 'you' : 'connected'),
      posts: profile.posts,
      clubs: profile.clubs,
      connectionsCount: profile.connectionsCount,
    });

    setProfileLoading(false);
  };

  const handleCloseLookup = () => {
    setLookupModal(false);
    clearLookupState();
  };

  const handleCopyCode = async () => {
    if (!profileCode) {
      showToast('error', 'Profile code unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(profileCode);
      setCopiedCode(true);
      showToast('success', 'Profile code copied');
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setCopiedCode(false);
      showToast('error', 'Failed to copy code');
    }
  };

  const handleShareProfile = async () => {
    if (!profileCode || !user) {
      showToast('error', 'Profile code unavailable');
      return;
    }

    const shareText = `Connect with me on UniSphere\nName: ${user.name}\nProfile code: ${profileCode}`;
    const shareData = {
      title: 'UniSphere Profile',
      text: shareText,
    };

    setSharingProfile(true);

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('success', 'Profile shared');
      } else {
        await navigator.clipboard.writeText(shareText);
        showToast('success', 'Profile details copied');
      }
    } catch (error) {
      const maybeError = error as { name?: string };

      if (maybeError?.name === 'AbortError') {
        showToast('error', 'Share cancelled');
      } else {
        try {
          await navigator.clipboard.writeText(shareText);
          showToast('success', 'Profile details copied');
        } catch {
          showToast('error', 'Failed to share profile');
        }
      }
    } finally {
      setSharingProfile(false);
    }
  };

  const profileCode = user?.id ?? '';
  const qrValue = profileCode ? `unisphere-profile:${profileCode}` : '';
  const qrImageUrl = profileCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrValue)}`
    : '';

  if (loading) {
    return (
      <div className="content-area fade-in">
        <div className="px-5 pt-16 pb-4">
          <div className="h-8 w-24 shimmer rounded-xl mb-4" />
          <div className="h-28 shimmer rounded-3xl mb-5" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <ConnectionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <FeedbackToast visible={toastVisible} type={toastType} message={toastMessage} />

      <div className="content-area fade-in">
        <div className="relative px-5 pt-14 pb-1">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-600/7 to-transparent pointer-events-none" />
          <div className="relative mb-5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Users size={13} className="text-primary-400" />
              <span className="text-micro text-primary-400 uppercase tracking-widest">Connect</span>
            </div>
            <div className="flex items-end justify-between">
              <h1 className="text-display text-white" style={{ letterSpacing: '-0.03em' }}>
                Network
              </h1>
              <div className="flex items-center gap-2 pb-1">
                {requests.length > 0 && (
                  <button
                    onClick={() => setShowRequests((v) => !v)}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all active:scale-95"
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.25)',
                    }}
                  >
                    <Bell size={12} className="text-primary-400" />
                    <span className="text-xs font-bold text-primary-400">{requests.length}</span>
                  </button>
                )}
                {onOpenNotifications && <NotificationBell onClick={onOpenNotifications} />}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-5">
          <div
            className="relative rounded-4xl overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.09) 50%, rgba(6,182,212,0.06) 100%)',
              border: '1px solid rgba(99,102,241,0.22)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <Avatar name={user?.name || 'Student'} src={user?.avatarUrl} size="xl" ring />
                  <button
                    onClick={() => setQrModal(true)}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: '2px solid rgba(10,14,26,0.9)',
                    }}
                  >
                    <QrCode size={15} className="text-white" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                  </div>
                  <h3 className="text-[18px] font-extrabold text-white tracking-tight leading-none mb-1">
                    {user?.name || 'Student'}
                  </h3>
                  <p className="text-xs text-white/45 font-medium mb-0.5">{user?.branch || 'Branch'}</p>
                  <p className="text-xs text-white/30 font-medium mb-3">
                    {user?.degree || 'B.Tech'} · {user?.year || 'Year'}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setQrModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                      }}
                    >
                      <QrCode size={12} />
                      My QR
                    </button>

                    <button
                      onClick={() => setScannerModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/60 transition-all active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <ScanLine size={12} />
                      Scan / Enter Code
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Connections', value: String(connections.length) },
                  { label: 'Clubs', value: String(user?.clubs ?? 0) },
                  { label: 'Posts', value: String(user?.posts ?? 0) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center py-2.5 rounded-2xl"
                    style={{
                      background: 'rgba(10,14,26,0.4)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p
                      className="text-base font-extrabold"
                      style={{
                        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[9px] text-white/30 font-semibold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-5">
          <div
            className="rounded-3xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
              <span className="text-sm font-bold text-white tracking-tight">Post a Connection Note</span>
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              placeholder="Ask for help, share an update, or post something for your connections..."
              className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none font-medium resize-none placeholder-white/25"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />

            <div className="flex justify-end mt-3">
              <Button
                variant="primary"
                size="sm"
                icon={<Send size={12} />}
                onClick={handleCreateNote}
                disabled={postingNote || !newNote.trim()}
              >
                {postingNote ? 'Posting...' : 'Post Note'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between px-5 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
              <div className="flex items-center gap-1.5">
                <MessageSquare size={13} className="text-primary-400" />
                <span className="text-sm font-bold text-white tracking-tight">Connection Notes</span>
              </div>
            </div>
            <span className="text-[10px] text-white/30 font-semibold">Only from accepted connections</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pl-5 pr-3 pb-2" style={{ scrollbarWidth: 'none' }}>
            {notes.length > 0 ? (
              notes.map((note) => <NoteCard key={note.id} note={note} />)
            ) : (
              <div className="px-5">
                <p className="text-sm font-bold text-white mb-1">No notes yet</p>
                <p className="text-xs text-white/35">Post one or connect with more people</p>
              </div>
            )}
          </div>
        </div>

        {showRequests && requests.length > 0 && (
          <div className="px-4 mb-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
                <span className="text-sm font-bold text-white tracking-tight">
                  Connection Requests
                  <span
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-extrabold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6 100%)' }}
                  >
                    {requests.length}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {requests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onAccept={() => handleAccept(req.id)}
                  onDecline={() => handleDecline(req.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <span className="text-sm font-bold text-white tracking-tight">
              My Network
              <span className="ml-2 text-xs font-semibold text-white/30">{connections.length}</span>
            </span>
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Search size={14} className="text-white/25 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search connections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} className="text-white/30" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {filteredConnections.length > 0 ? (
              filteredConnections.map((conn) => (
                <ConnectionCard
                  key={conn.id}
                  conn={conn}
                  expanded={expanded === conn.id}
                  onToggle={() => setExpanded(expanded === conn.id ? null : conn.id)}
                  onViewProfile={() => handleOpenConnectionProfile(conn)}
                  onMessage={() => openMessagePlaceholder({ id: conn.id, name: conn.name })}
                  onInvalidLink={(message) => showToast('error', message)}
                />
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-white mb-1">No connections yet</p>
                <p className="text-xs text-white/35">Accept requests or send new connection invites</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <InlineModal isOpen={qrModal} onClose={() => setQrModal(false)} title="My Campus QR">
        <div className="flex flex-col items-center py-2">
          <div
            className="rounded-4xl p-5 mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.22)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/8 to-violet-600/5" />
            <div className="relative z-10 bg-white rounded-3xl p-4 shadow-lg">
              {profileCode && !qrImageFailed ? (
                <img
                  src={qrImageUrl}
                  alt="Scannable profile QR"
                  className="w-[220px] h-[220px] object-contain"
                  onError={() => setQrImageFailed(true)}
                />
              ) : (
                <div className="w-[220px] h-[220px] flex items-center justify-center">
                  <QRGrid size={7} />
                </div>
              )}
            </div>
          </div>

          <Avatar name={user?.name || 'Student'} src={user?.avatarUrl} size="lg" className="mb-3" ring />
          <p className="font-extrabold text-white text-xl tracking-tight mb-0.5">{user?.name || 'Student'}</p>
          <p className="text-sm text-white/40 mb-0.5 font-medium">
            {user?.branch || 'Branch'} · {user?.year || 'Year'}
          </p>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl mt-2 mb-2"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p className="text-xs text-primary-400 font-semibold">
              Profile code: {profileCode || 'Unavailable'}
            </p>
            <button onClick={handleCopyCode} className="text-white/40 hover:text-white transition-colors">
              {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <p className="text-[11px] text-white/30 text-center mb-6">
            This QR encodes your profile code. Another user can scan it later, or enter the code manually right now.
          </p>

          <div className="w-full flex gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={<Share2 size={15} />}
              className="flex-1"
              disabled={!profileCode || sharingProfile}
              onClick={handleShareProfile}
            >
              {sharingProfile ? 'Sharing...' : 'Share Profile'}
            </Button>
            <button
              className="rounded-2xl px-4 text-white/50 hover:text-white transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={() => setQrModal(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </InlineModal>

      <InlineModal isOpen={scannerModal} onClose={() => setScannerModal(false)} title="Scan QR Code">
        <div className="flex flex-col items-center py-2">
          <div
            className="w-full rounded-3xl p-3 mb-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full overflow-hidden rounded-2xl"
              style={{
                minHeight: '280px',
                background: 'rgba(0,0,0,0.35)',
              }}
            />
          </div>

          {scannerStatus && (
            <p className="text-[12px] text-white/55 font-medium text-center mb-2">{scannerStatus}</p>
          )}

          {scannerError && (
            <div
              className="w-full rounded-2xl px-4 py-3 mb-4"
              style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.16)',
              }}
            >
              <p className="text-[12px] text-rose-300 text-center">{scannerError}</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-2">
            <Button
              variant="secondary"
              size="lg"
              icon={<Search size={14} />}
              fullWidth
              onClick={() => {
                setScannerModal(false);
                setLookupModal(true);
                setLookupError('');
              }}
            >
              Enter Code Manually
            </Button>

            <button
              onClick={() => setScannerModal(false)}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white/60 transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Close Scanner
            </button>
          </div>
        </div>
      </InlineModal>

      <InlineModal isOpen={lookupModal} onClose={handleCloseLookup} title="Scan / Enter Profile Code">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Camera size={13} />}
              className="flex-1"
              onClick={() => {
                handleCloseLookup();
                setScannerModal(true);
              }}
            >
              Open Scanner
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<QrCode size={13} />}
              className="flex-1"
              onClick={handleCopyCode}
            >
              My Code
            </Button>
          </div>

          <div>
            <p className="text-[11px] text-white/35 mb-2">Enter the code shown on another user's QR card</p>
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => {
                setLookupCode(e.target.value);
                setLookupError('');
              }}
              placeholder="Enter profile code"
              className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none font-medium placeholder-white/25"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          {lookupError && (
            <div
              className="w-full rounded-2xl px-4 py-3"
              style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.16)',
              }}
            >
              <p className="text-[12px] text-rose-300 text-center">{lookupError}</p>
            </div>
          )}

          <Button variant="primary" size="lg" icon={<ScanLine size={14} />} onClick={handleLookupProfile} disabled={lookupLoading}>
            {lookupLoading ? 'Looking up...' : 'Find Profile'}
          </Button>

          {lookupProfile && (
            <div
              className="rounded-3xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-start gap-3">
                <Avatar src={lookupProfile.avatarUrl} name={lookupProfile.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white">{lookupProfile.name}</p>
                  <p className="text-[11px] text-white/40">
                    {lookupProfile.branch} · {lookupProfile.year}
                  </p>
                  {lookupProfile.bio && (
                    <p className="text-[11px] text-white/55 mt-2 leading-relaxed">
                      {lookupProfile.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="primary"
                  size="md"
                  icon={<UserPlus size={13} />}
                  fullWidth
                  onClick={handleConnectLookupProfile}
                  disabled={
                    sendingConnectionId === lookupProfile.id ||
                    !!lookupError ||
                    lookupProfile.relationshipStatus === 'connected' ||
                    lookupProfile.relationshipStatus === 'request_sent' ||
                    lookupProfile.relationshipStatus === 'you'
                  }
                >
                  {lookupProfile.relationshipStatus === 'connected'
                    ? 'Already Connected'
                    : lookupProfile.relationshipStatus === 'request_sent'
                    ? 'Request Sent'
                    : lookupProfile.relationshipStatus === 'you'
                    ? 'This is You'
                    : sendingConnectionId === lookupProfile.id
                    ? 'Sending...'
                    : 'Send Connection Request'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </InlineModal>

      <InlineModal isOpen={profileModal} onClose={closeProfileModal} title="Student Profile">
        {profileLoading ? (
          <div className="py-8 flex flex-col gap-3">
            <div className="h-24 shimmer rounded-3xl" />
            <div className="h-14 shimmer rounded-2xl" />
            <div className="h-14 shimmer rounded-2xl" />
          </div>
        ) : selectedProfile ? (
          <div className="flex flex-col gap-4 py-2">
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                border: '1px solid rgba(99,102,241,0.18)',
              }}
            >
              <div className="flex items-start gap-4">
                <Avatar src={selectedProfile.avatarUrl} name={selectedProfile.name} size="xl" ring />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[18px] font-extrabold text-white tracking-tight">{selectedProfile.name}</p>
                      <p className="text-[12px] text-white/45 font-medium mt-1">{selectedProfile.branch}</p>
                      <p className="text-[12px] text-white/35 font-medium">
                        {selectedProfile.degree} · {selectedProfile.year}
                      </p>
                    </div>

                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide flex-shrink-0"
                      style={{
                        background: getRelationshipBadgeStyles(selectedProfile.relationshipStatus).background,
                        border: getRelationshipBadgeStyles(selectedProfile.relationshipStatus).border,
                        color: getRelationshipBadgeStyles(selectedProfile.relationshipStatus).color,
                      }}
                    >
                      {getRelationshipBadgeStyles(selectedProfile.relationshipStatus).text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div
                      className="px-2.5 py-1 rounded-xl text-[10px] font-bold"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        color: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      {selectedProfile.mutual ?? 0} mutual connections
                    </div>
                  </div>
                </div>
              </div>

              {(selectedProfile.posts !== undefined ||
                selectedProfile.clubs !== undefined ||
                selectedProfile.connectionsCount !== undefined) && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div
                    className="text-center py-2.5 rounded-2xl"
                    style={{
                      background: 'rgba(10,14,26,0.35)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p className="text-base font-extrabold text-white">{selectedProfile.posts ?? 0}</p>
                    <p className="text-[9px] text-white/30 font-semibold">Posts</p>
                  </div>

                  <div
                    className="text-center py-2.5 rounded-2xl"
                    style={{
                      background: 'rgba(10,14,26,0.35)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p className="text-base font-extrabold text-white">{selectedProfile.clubs ?? 0}</p>
                    <p className="text-[9px] text-white/30 font-semibold">Clubs</p>
                  </div>

                  <div
                    className="text-center py-2.5 rounded-2xl"
                    style={{
                      background: 'rgba(10,14,26,0.35)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p className="text-base font-extrabold text-white">{selectedProfile.connectionsCount ?? 0}</p>
                    <p className="text-[9px] text-white/30 font-semibold">Connections</p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] uppercase tracking-widest text-primary-400 font-bold mb-2">About</p>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  {selectedProfile.bio?.trim() || 'No bio added yet.'}
                </p>
              </div>
            </div>

            {(selectedProfile.instagram ||
              selectedProfile.linkedin ||
              selectedProfile.github ||
              selectedProfile.portfolio) && (
              <div
                className="rounded-3xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
                  <span className="text-sm font-bold text-white tracking-tight">Social Links</span>
                </div>

                <div className="flex flex-col gap-2">
                  {selectedProfile.instagram && (
                    <SocialLink
                      icon={<Instagram size={13} />}
                      label="Instagram"
                      value={selectedProfile.instagram}
                      onInvalidLink={(message) => showToast('error', message)}
                    />
                  )}
                  {selectedProfile.linkedin && (
                    <SocialLink
                      icon={<Linkedin size={13} />}
                      label="LinkedIn"
                      value={selectedProfile.linkedin}
                      onInvalidLink={(message) => showToast('error', message)}
                    />
                  )}
                  {selectedProfile.github && (
                    <SocialLink
                      icon={<Github size={13} />}
                      label="GitHub"
                      value={selectedProfile.github}
                      onInvalidLink={(message) => showToast('error', message)}
                    />
                  )}
                  {selectedProfile.portfolio && (
                    <SocialLink
                      icon={<Globe size={13} />}
                      label="Portfolio"
                      value={selectedProfile.portfolio}
                      onInvalidLink={(message) => showToast('error', message)}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                icon={<MessageSquare size={13} />}
                className="flex-1"
                disabled={selectedProfile.relationshipStatus !== 'connected'}
                onClick={() =>
                  openMessagePlaceholder({
                    id: selectedProfile.id,
                    name: selectedProfile.name,
                  })
                }
              >
                {selectedProfile.relationshipStatus === 'connected'
                  ? 'Message'
                  : selectedProfile.relationshipStatus === 'request_sent'
                  ? 'Request Sent'
                  : selectedProfile.relationshipStatus === 'you'
                  ? 'You'
                  : 'Not Connected'}
              </Button>

              <Button variant="secondary" size="md" icon={<X size={13} />} className="flex-1" onClick={closeProfileModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm font-bold text-white mb-1">Profile unavailable</p>
            <p className="text-xs text-white/35">Could not load this profile</p>
          </div>
        )}
      </InlineModal>

      <InlineModal isOpen={messageModal} onClose={closeMessageModal} title="Direct Messages">
        <div className="flex flex-col gap-4 py-2">
          <div
            className="rounded-3xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.18)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <MessageSquare size={20} className="text-primary-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-extrabold text-white tracking-tight">
                  Messaging is coming soon
                </p>
                <p className="text-[12px] text-white/55 leading-relaxed mt-1">
                  {messageTarget
                    ? `You’ll be able to chat directly with ${messageTarget.name} here once the messaging module is built.`
                    : 'You’ll be able to chat directly with your connections here once the messaging module is built.'}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-3xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
              <span className="text-sm font-bold text-white tracking-tight">Planned first version</span>
            </div>
            <div className="text-[12px] text-white/60 leading-6">
              <div>• one-to-one chat between accepted connections</div>
              <div>• recent conversations list</div>
              <div>• unread indicators</div>
              <div>• simple text messaging first</div>
            </div>
          </div>

          <Button variant="primary" size="md" icon={<Check size={13} />} fullWidth onClick={closeMessageModal}>
            Got it
          </Button>
        </div>
      </InlineModal>
    </>
  );
}
