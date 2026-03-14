import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Building2,
  Search,
  CheckCircle2,
  Shield,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUserRole } from '../services/userService';
import {
  assignClubAdmin,
  createClub,
  getClubs,
  type CreateClubPayload,
} from '../services/clubService';
import type { Club, User } from '../types';

const CATEGORIES = [
  'Technology',
  'Design',
  'Entrepreneurship',
  'Culture',
  'Sports',
];

export default function AdminClubsPage() {
  const { user } = useAuth();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const [creating, setCreating] = useState(false);
  const [assigningClubId, setAssigningClubId] = useState<number | null>(null);
  const [selectedAdminIds, setSelectedAdminIds] = useState<Record<number, string>>({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateClubPayload>({
    name: '',
    username: '',
    description: '',
    category: 'Technology',
    avatar: '',
    coverImage: '',
    tags: [],
  });

  const [tagsInput, setTagsInput] = useState('');

  const isSuperAdmin = user?.role === 'super_admin';

  async function loadData() {
    const [clubsData, usersData] = await Promise.all([getClubs(), getAllUsers()]);
    setClubs(clubsData);
    setUsers(usersData);
  }

  useEffect(() => {
    loadData();
  }, []);

  const eligibleUsers = useMemo(() => {
    return users.filter((u) => u.role === 'student' || u.role === 'club_admin');
  }, [users]);

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(q) ||
        club.category.toLowerCase().includes(q) ||
        club.username.toLowerCase().includes(q)
    );
  }, [clubs, search]);

  function updateForm<K extends keyof CreateClubPayload>(key: K, value: CreateClubPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetMessages() {
    setSuccess('');
    setError('');
  }

  async function handleCreateClub() {
    resetMessages();

    if (!form.name.trim() || !form.username.trim() || !form.description.trim()) {
      setError('Name, username, and description are required.');
      return;
    }

    setCreating(true);

    try {
      const payload: CreateClubPayload = {
        ...form,
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const created = await createClub(payload);

      if (!created) {
        setError('Failed to create club.');
        return;
      }

      setSuccess('Club created successfully.');
      setForm({
        name: '',
        username: '',
        description: '',
        category: 'Technology',
        avatar: '',
        coverImage: '',
        tags: [],
      });
      setTagsInput('');
      await loadData();
    } finally {
      setCreating(false);
    }
  }

  async function handleAssignAdmin(clubId: number) {
    resetMessages();

    const selectedUserId = selectedAdminIds[clubId];
    if (!selectedUserId) {
      setError('Select a user first.');
      return;
    }

    setAssigningClubId(clubId);

    try {
      const selectedUser = users.find((u) => u.id === selectedUserId);

      if (!selectedUser) {
        setError('Selected user not found.');
        return;
      }

      if (selectedUser.role !== 'club_admin') {
        const promoted = await updateUserRole(selectedUser.id, 'club_admin');
        if (!promoted) {
          setError('Failed to promote user to club admin.');
          return;
        }
      }

      const assigned = await assignClubAdmin(clubId, selectedUserId);

      if (assigned.error) {
        setError(assigned.error);
        return;
      }

      setSuccess('Club admin assigned successfully.');
      await loadData();
    } finally {
      setAssigningClubId(null);
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <div
          className="rounded-3xl p-6 text-center max-w-sm"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Shield size={24} className="text-white/30 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">Super Admin Only</p>
          <p className="text-white/40 text-sm">
            You do not have permission to access club administration.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-2xl px-4 py-3 text-sm text-white outline-none font-medium placeholder-white/25';
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <div className="min-h-dvh pb-24">
      <div className="pt-12 px-4 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.25)',
            }}
          >
            <Building2 size={16} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.025em' }}>
              Admin Clubs
            </h1>
            <p className="text-[11px] text-white/35">Create clubs and assign club admins</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div
          className="rounded-3xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus size={15} className="text-primary-400" />
            <p className="text-sm font-bold text-white">Create New Club</p>
          </div>

          <div className="grid gap-3">
            <input
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Club name"
              className={inputClass}
              style={inputStyle}
            />

            <input
              value={form.username}
              onChange={(e) => updateForm('username', e.target.value)}
              placeholder="Username (example: devsoc)"
              className={inputClass}
              style={inputStyle}
            />

            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Club description"
              rows={3}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />

            <select
              value={form.category}
              onChange={(e) => updateForm('category', e.target.value)}
              className={inputClass}
              style={{ ...inputStyle, appearance: 'none' as const }}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category} style={{ background: '#0a0e1a' }}>
                  {category}
                </option>
              ))}
            </select>

            <input
              value={form.avatar || ''}
              onChange={(e) => updateForm('avatar', e.target.value)}
              placeholder="Avatar image URL (optional)"
              className={inputClass}
              style={inputStyle}
            />

            <input
              value={form.coverImage || ''}
              onChange={(e) => updateForm('coverImage', e.target.value)}
              placeholder="Cover image URL (optional)"
              className={inputClass}
              style={inputStyle}
            />

            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags separated by commas"
              className={inputClass}
              style={inputStyle}
            />

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                }}
              >
                <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-rose-300">{error}</p>
              </div>
            )}

            {success && (
              <div
                className="flex items-start gap-2.5 rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(52,211,153,0.08)',
                  border: '1px solid rgba(52,211,153,0.2)',
                }}
              >
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-emerald-300">{success}</p>
              </div>
            )}

            <button
              onClick={handleCreateClub}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              {creating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating Club...
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Create Club
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs"
            className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm text-white outline-none placeholder-white/25"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </div>

      <div className="px-4">
        {filteredClubs.length === 0 ? (
          <div
            className="rounded-3xl p-6 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Building2 size={22} className="text-white/20 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/40">No clubs found</p>
          </div>
        ) : (
          filteredClubs.map((club) => (
            <div
              key={club.id}
              className="rounded-3xl p-4 mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={club.avatar}
                  alt={club.name}
                  className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold text-white">{club.name}</p>
                    {club.verified && (
                      <span
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-300"
                        style={{
                          background: 'rgba(52,211,153,0.1)',
                          border: '1px solid rgba(52,211,153,0.2)',
                        }}
                      >
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    {club.username} · {club.category}
                  </p>
                  <p className="text-[12px] text-white/55 mt-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-2 mb-3 text-[11px] text-white/40"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}
              >
                <Users size={12} />
                {club.followers} followers
              </div>

              <div className="grid gap-2">
                <select
                  value={selectedAdminIds[club.id] || ''}
                  onChange={(e) =>
                    setSelectedAdminIds((prev) => ({
                      ...prev,
                      [club.id]: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    appearance: 'none',
                  }}
                >
                  <option value="" style={{ background: '#0a0e1a' }}>
                    Select user to assign as club admin
                  </option>
                  {eligibleUsers.map((u) => (
                    <option key={u.id} value={u.id} style={{ background: '#0a0e1a' }}>
                      {u.name} · {u.email} · {u.role}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAssignAdmin(club.id)}
                  disabled={assigningClubId === club.id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60"
                  style={{
                    background: 'rgba(56,189,248,0.14)',
                    border: '1px solid rgba(56,189,248,0.25)',
                    color: '#67e8f9',
                  }}
                >
                  {assigningClubId === club.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Shield size={14} />
                      Assign Club Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}