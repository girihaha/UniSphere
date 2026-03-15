import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Sparkles, Users, ChevronRight, Search } from 'lucide-react';
import { ClubCardSkeleton } from '../components/Skeleton';
import TagBadge from '../components/TagBadge';
import Button from '../components/Button';
import ClubProfilePage from './ClubProfilePage';
import {
  getClubs,
  followClub,
  unfollowClub,
  categories,
} from '../services/clubService';

interface ClubsPageProps {
  selectedClubId?: number;
  onOpenClub?: (clubId: number) => void;
  onBackFromClub?: () => void;
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full gradient-accent" />
        <span className="text-sm font-bold text-white tracking-tight">{title}</span>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1 text-xs text-primary-400 font-semibold"
        >
          {action.label} <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

function ClubLogo({ club, size = 'md' }: { club: any; size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-[52px] h-[52px] rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
  };

  const fallbackColor =
    club.category === 'Technology'
      ? 'from-indigo-500 to-violet-500'
      : club.category === 'Design'
      ? 'from-pink-500 to-rose-500'
      : club.category === 'Entrepreneurship'
      ? 'from-emerald-500 to-teal-500'
      : 'from-slate-500 to-slate-700';

  return (
    <div
      className={`${dims[size]} bg-gradient-to-br ${club.color || fallbackColor} flex-shrink-0 relative overflow-hidden shadow-glass-sm`}
    >
      {(club.logoImage || club.avatar) && (
        <img
          src={club.logoImage || club.avatar}
          alt={club.name}
          className="w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
      )}
    </div>
  );
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
    logoImage: rawClub.avatar || '',
    heroImage: rawClub.coverImage || rawClub.avatar || '',
    categoryTag,
    color,
    tagline: rawClub.username || rawClub.description || '',
    recommended: rawClub.followers > 300,
    founded: rawClub.founded || '2024',
    type: rawClub.type || rawClub.category || 'Club',
    posts: rawClub.posts || [],
    isFollowing: !!rawClub.isFollowing,
  };
}

export default function ClubsPage({
  selectedClubId,
  onOpenClub,
  onBackFromClub,
}: ClubsPageProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingClubId, setTogglingClubId] = useState<number | null>(null);

  const loadClubsData = async () => {
    setLoading(true);
    try {
      const clubsData = await getClubs();
      const normalized = (clubsData || []).map(normalizeClub);
      setClubs(normalized);

      if (selectedClub) {
        const updatedSelected = normalized.find((c) => c.id === selectedClub.id) || null;
        setSelectedClub(updatedSelected);
      }
    } catch (error) {
      console.error('Failed to load clubs:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubsData();
  }, []);

  useEffect(() => {
    if (!selectedClubId) {
      setSelectedClub(null);
      return;
    }

    const matchedClub = clubs.find((club) => club.id === selectedClubId);
    if (matchedClub) {
      setSelectedClub(matchedClub);
    }
  }, [clubs, selectedClubId]);

  const openClub = (club: any) => {
    if (onOpenClub) {
      onOpenClub(club.id);
      return;
    }

    setSelectedClub(club);
  };

  const closeClub = () => {
    if (onBackFromClub) {
      onBackFromClub();
      return;
    }

    setSelectedClub(null);
  };

  const updateClubLocally = (clubId: number, isFollowing: boolean) => {
    setClubs((prev) =>
      prev.map((club) =>
        club.id === clubId
          ? {
              ...club,
              isFollowing,
            }
          : club
      )
    );

    setSelectedClub((prev: any) =>
      prev && prev.id === clubId
        ? {
            ...prev,
            isFollowing,
          }
        : prev
    );
  };

  const handleToggleFollow = async (clubId: number) => {
    if (togglingClubId === clubId) return;

    const currentClub = clubs.find((c) => c.id === clubId) || selectedClub;
    if (!currentClub) return;

    const nextFollowing = !currentClub.isFollowing;
    setTogglingClubId(clubId);

    try {
      if (nextFollowing) {
        const result = await followClub(clubId);
        if (result.error) {
          console.error(result.error);
          setTogglingClubId(null);
          return;
        }
      } else {
        const result = await unfollowClub(clubId);
        if (result.error) {
          console.error(result.error);
          setTogglingClubId(null);
          return;
        }
      }

      updateClubLocally(clubId, nextFollowing);

      setTimeout(() => {
        loadClubsData();
      }, 150);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setTogglingClubId(null);
    }
  };

  const recommended = useMemo(() => clubs.filter((c) => c.recommended), [clubs]);

  const filtered = useMemo(
    () =>
      clubs.filter((c) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q);
        const matchCat = activeCategory === 'All' || c.category === activeCategory;
        return matchSearch && matchCat;
      }),
    [clubs, search, activeCategory]
  );

  if (selectedClub) {
    return (
      <ClubProfilePage
        club={selectedClub}
        followed={!!selectedClub.isFollowing}
        onToggleFollow={() => handleToggleFollow(selectedClub.id)}
        onBack={closeClub}
      />
    );
  }

  const isFiltering = !!search || activeCategory !== 'All';

  if (loading) {
    return (
      <div className="content-area fade-in">
        <div className="px-5 pt-16 pb-4">
          <div className="h-8 w-20 shimmer rounded-xl mb-6" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <ClubCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area fade-in">
      <div className="relative pt-14 pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/8 via-transparent to-transparent pointer-events-none" />
        <div className="px-5 relative">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles size={13} className="text-primary-400" />
                <span className="text-micro text-primary-400 uppercase tracking-widest">Discover</span>
              </div>
              <h1 className="text-display text-white" style={{ letterSpacing: '-0.03em' }}>
                Clubs
              </h1>
            </div>
            <button className="glass-card p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors">
              <TrendingUp size={17} />
            </button>
          </div>
          <p className="text-body text-white/40 mb-5">Find your community on campus</p>

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <Search size={15} className="text-white/30 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/28 outline-none font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-white/35 hover:text-white/70 transition-colors text-xs font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold
                  transition-all duration-200 active:scale-95
                  ${
                    activeCategory === cat
                      ? 'gradient-accent text-white shadow-accent'
                      : 'glass text-white/40 hover:text-white/70 hover:bg-white/8'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isFiltering && (
        <div className="mt-5 mb-6">
          <div className="px-5">
            <SectionHeader title="Recommended Clubs" />
          </div>

          <div className="flex gap-3 overflow-x-auto pl-5 pr-3 pb-1">
            {recommended.map((club) => (
              <div key={club.id} className="flex-shrink-0 w-44 text-left rounded-3xl">
                <div
                  className="rounded-3xl overflow-hidden card-hover shadow-glass"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div
                    className={`h-[96px] bg-gradient-to-br ${club.color} relative overflow-hidden cursor-pointer`}
                    onClick={() => openClub(club)}
                  >
                    {club.heroImage && (
                      <img
                        src={club.heroImage}
                        alt={club.name}
                        className="w-full h-full object-cover opacity-45 mix-blend-overlay"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2.5 left-3">
                      <TagBadge label={club.category} variant={club.categoryTag} size="sm" />
                    </div>
                  </div>

                  <div className="p-3.5">
                    <div onClick={() => openClub(club)} className="cursor-pointer">
                      <p className="text-[13px] font-bold text-white leading-tight tracking-tight mb-1">
                        {club.name}
                      </p>
                      <p className="text-[11px] text-white/42 leading-snug line-clamp-2 mb-3 italic">
                        {club.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users size={10} className="text-white/30" />
                        <span className="text-[10px] text-white/35 font-semibold">{club.members}</span>
                      </div>
                      <button
                        onClick={() => handleToggleFollow(club.id)}
                        disabled={togglingClubId === club.id}
                        className={`
                          text-[11px] font-bold px-2.5 py-1 rounded-lg
                          transition-all duration-200 active:scale-90 disabled:opacity-60
                          ${
                            club.isFollowing
                              ? 'text-white/50 bg-white/8 border border-white/10'
                              : 'gradient-accent text-white shadow-accent'
                          }
                        `}
                      >
                        {togglingClubId === club.id
                          ? '...'
                          : club.isFollowing
                          ? '✓ Following'
                          : '+ Follow'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full gradient-accent" />
            <span className="text-sm font-bold text-white tracking-tight">
              {isFiltering ? 'Results' : 'All Clubs'}
            </span>
          </div>
          <span
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-white/35"
            style={{
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            {filtered.length} {filtered.length === 1 ? 'club' : 'clubs'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="w-14 h-14 glass-strong rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-white/25" />
            </div>
            <p className="text-[15px] font-bold text-white mb-1">No clubs found</p>
            <p className="text-[13px] text-white/40">Try a different search or category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            {filtered.map((club, index) => (
              <div
                key={club.id}
                className="w-full transition-all duration-200"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div
                  className="rounded-3xl overflow-hidden card-hover shadow-glass"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.038) 100%)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    backdropFilter: 'blur(24px)',
                  }}
                >
                  <div
                    className="flex items-center gap-4 p-4 pb-3 cursor-pointer"
                    onClick={() => openClub(club)}
                  >
                    <ClubLogo club={club} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-white text-[13px] leading-tight tracking-tight truncate">
                          {club.name}
                        </p>
                        {club.recommended && (
                          <span className="flex-shrink-0 text-[9px] font-bold text-amber-400 bg-amber-500/12 border border-amber-500/25 px-1.5 py-[2px] rounded-full">
                            ★ Top
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/42 leading-relaxed line-clamp-1 mb-2">
                        {club.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <TagBadge label={club.category} variant={club.categoryTag} size="sm" />
                        <div className="flex items-center gap-1">
                          <Users size={9} className="text-white/25" />
                          <span className="text-[10px] text-white/30 font-semibold">{club.members}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={club.isFollowing ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={(e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleToggleFollow(club.id);
                      }}
                      className="flex-shrink-0 !px-3 !py-1.5 !text-[11px] !font-bold"
                    >
                      {togglingClubId === club.id
                        ? '...'
                        : club.isFollowing
                        ? 'Following'
                        : 'Follow'}
                    </Button>
                  </div>

                  <div className="mx-4 mb-3.5 rounded-2xl overflow-hidden h-[72px]">
                    {club.heroImage && (
                      <img
                        src={club.heroImage}
                        alt=""
                        className="w-full h-full object-cover opacity-30"
                        style={{ filter: 'saturate(0.7)' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
