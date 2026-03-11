import { useState, useEffect } from 'react';
import {
  Share2, QrCode, ChevronRight, Users, MessageSquare,
  Instagram, Linkedin, Github, Globe, Check, X, Bell,
  Search, UserCheck,
} from 'lucide-react';
import { ConnectionCardSkeleton } from '../components/Skeleton';
import NotificationBell from '../components/NotificationBell';
import Avatar from '../components/Avatar';
import TagBadge from '../components/TagBadge';
import Button from '../components/Button';
import ModalContainer from '../components/ModalContainer';
import {
  connections as allConnections,
  connectionRequests as allRequests,
  networkNotes,
  Connection,
  ConnectionRequest,
} from '../data/network';

const QR_PATTERN = [0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 24, 27, 28, 31, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48];

function QRGrid({ size = 7, small = false }: { size?: number; small?: boolean }) {
  const cellSize = small ? 'w-[6px] h-[6px]' : 'w-[26px] h-[26px]';
  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {Array(size * size).fill(0).map((_, i) => (
        <div
          key={i}
          className={`${cellSize} rounded-[2px] ${QR_PATTERN.includes(i) ? 'bg-primary-400' : 'bg-white/8'}`}
        />
      ))}
    </div>
  );
}

function SocialLink({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <a
      href="#"
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl transition-all active:scale-95"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onClick={(e) => e.preventDefault()}
    >
      <span className="text-primary-400 flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{label}</p>
        <p className="text-[11px] font-semibold text-white/70 truncate">{value}</p>
      </div>
      <ChevronRight size={11} className="text-white/20 flex-shrink-0" />
    </a>
  );
}

function ConnectionCard({
  conn,
  expanded,
  onToggle,
}: {
  conn: Connection;
  expanded: boolean;
  onToggle: () => void;
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
        <Avatar
          src={conn.avatar}
          name={conn.name}
          size="md"
          status={conn.online ? 'online' : null}
        />
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
                <SocialLink icon={<Instagram size={13} />} label="Instagram" value={conn.instagram} />
              )}
              {conn.linkedin && (
                <SocialLink icon={<Linkedin size={13} />} label="LinkedIn" value={conn.linkedin} />
              )}
              {conn.github && (
                <SocialLink icon={<Github size={13} />} label="GitHub" value={conn.github} />
              )}
              {conn.portfolio && (
                <SocialLink icon={<Globe size={13} />} label="Portfolio" value={conn.portfolio} />
              )}
            </div>
          )}
          <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Button variant="primary" size="sm" icon={<MessageSquare size={12} />} className="flex-1">
              Message
            </Button>
            <Button variant="secondary" size="sm" icon={<UserCheck size={12} />} className="flex-1">
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

function NoteCard({ note }: { note: (typeof networkNotes)[0] }) {
  return (
    <div
      className="flex-shrink-0 w-[200px] p-3.5 rounded-3xl"
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
      <p className="text-[12px] text-white/65 leading-relaxed font-medium mb-2">
        {note.text}
      </p>
      <p className="text-[9px] text-white/25 font-semibold">{note.time}</p>
    </div>
  );
}

export default function NetworkPage({ onOpenNotifications }: { onOpenNotifications?: () => void }) {
  const [qrModal, setQrModal] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState(allRequests);
  const [showRequests, setShowRequests] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 750);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="content-area fade-in">
        <div className="px-5 pt-16 pb-4">
          <div className="h-8 w-24 shimmer rounded-xl mb-4" />
          <div className="h-28 shimmer rounded-3xl mb-5" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => <ConnectionCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const filteredConnections = allConnections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.branch.toLowerCase().includes(search.toLowerCase())
  );

  const handleAccept = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="content-area fade-in">
      <div className="relative px-5 pt-14 pb-1">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/7 to-transparent pointer-events-none" />
        <div className="relative mb-5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Users size={13} className="text-primary-400" />
            <span className="text-micro text-primary-400 uppercase tracking-widest">Connect</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="text-display text-white" style={{ letterSpacing: '-0.03em' }}>Network</h1>
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

      {/* QR Card */}
      <div className="px-4 mb-5">
        <div
          className="relative rounded-4xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.09) 50%, rgba(6,182,212,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.22)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />

          <div className="p-5">
            <div className="flex items-start gap-4">
              <button
                onClick={() => setQrModal(true)}
                className="flex-shrink-0 p-3 rounded-3xl transition-all duration-200 active:scale-90 hover:shadow-glow"
                style={{
                  background: 'rgba(10,14,26,0.5)',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >
                <QRGrid size={7} small />
              </button>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                </div>
                <h3 className="text-[18px] font-extrabold text-white tracking-tight leading-none mb-1">
                  Rohan Verma
                </h3>
                <p className="text-xs text-white/45 font-medium mb-0.5">Computer Science</p>
                <p className="text-xs text-white/30 font-medium mb-3">B.Tech · 3rd Year</p>

                <div className="flex gap-2">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/60 transition-all active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <Share2 size={12} />
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Connections', value: String(allConnections.length) },
                { label: 'Clubs', value: '6' },
                { label: 'Mutual', value: '34' },
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

      {/* Network Notes */}
      <div className="mb-5">
        <div className="flex items-center justify-between px-5 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <div className="flex items-center gap-1.5">
              <MessageSquare size={13} className="text-primary-400" />
              <span className="text-sm font-bold text-white tracking-tight">Network Notes</span>
            </div>
          </div>
          <span className="text-[10px] text-white/30 font-semibold">From your connections</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pl-5 pr-3 pb-2" style={{ scrollbarWidth: 'none' }}>
          {networkNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>

      {/* Connection Requests */}
      {showRequests && requests.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
              <span className="text-sm font-bold text-white tracking-tight">
                Connection Requests
                <span
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-extrabold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
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

      {/* My Network */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
          <span className="text-sm font-bold text-white tracking-tight">
            My Network
            <span className="ml-2 text-xs font-semibold text-white/30">{allConnections.length}</span>
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
              />
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-bold text-white mb-1">No results</p>
              <p className="text-xs text-white/35">Try a different name or branch</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      <ModalContainer isOpen={qrModal} onClose={() => setQrModal(false)} title="My Campus QR">
        <div className="flex flex-col items-center py-2">
          <div
            className="rounded-4xl p-6 mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.22)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/8 to-violet-600/5" />
            <div className="relative z-10">
              <div className="grid gap-[4px]" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {Array(49).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className={`w-[28px] h-[28px] rounded-[3px] ${QR_PATTERN.includes(i) ? 'bg-primary-400' : 'bg-white/6'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Avatar name="Rohan Verma" size="lg" className="mb-3" ring />
          <p className="font-extrabold text-white text-xl tracking-tight mb-0.5">Rohan Verma</p>
          <p className="text-sm text-white/40 mb-0.5 font-medium">Computer Science · 3rd Year</p>
          <p className="text-xs text-primary-400 font-semibold mb-6">
            unisphere.app/u/rohan.verma
          </p>

          <div className="w-full flex gap-3">
            <Button variant="primary" size="lg" icon={<Share2 size={15} />} className="flex-1">
              Share Profile
            </Button>
            <button
              className="glass-card rounded-2xl px-4 text-white/50 hover:text-white transition-colors"
              onClick={() => setQrModal(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </ModalContainer>
    </div>
  );
}
