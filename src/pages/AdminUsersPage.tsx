import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Search,
  Crown,
  User as UserIcon,
  Users,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getAllUsers, updateUserRole } from "../services/userService";
import { User } from "../types";
import Avatar from "../components/Avatar";

type RoleType = "student" | "club_admin" | "super_admin";

function getRoleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "club_admin") return "Club Admin";
  return "Student";
}

function getRoleStyles(role: string) {
  if (role === "super_admin") {
    return {
      icon: Crown,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.22)",
      text: "text-amber-300",
    };
  }

  if (role === "club_admin") {
    return {
      icon: Shield,
      color: "#818cf8",
      bg: "rgba(99,102,241,0.10)",
      border: "1px solid rgba(99,102,241,0.22)",
      text: "text-primary-300",
    };
  }

  return {
    icon: UserIcon,
    color: "#34d399",
    bg: "rgba(16,185,129,0.10)",
    border: "1px solid rgba(16,185,129,0.22)",
    text: "text-emerald-300",
  };
}

function RoleActionButton({
  label,
  active,
  onClick,
  tone,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone: "emerald" | "indigo" | "amber";
  disabled?: boolean;
}) {
  const tones = {
    emerald: {
      activeBg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      activeBorder: "1px solid rgba(16,185,129,0.3)",
      idleBg: "rgba(16,185,129,0.08)",
      idleBorder: "1px solid rgba(16,185,129,0.18)",
      idleColor: "#6ee7b7",
    },
    indigo: {
      activeBg: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      activeBorder: "1px solid rgba(99,102,241,0.3)",
      idleBg: "rgba(99,102,241,0.08)",
      idleBorder: "1px solid rgba(99,102,241,0.18)",
      idleColor: "#a5b4fc",
    },
    amber: {
      activeBg: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      activeBorder: "1px solid rgba(245,158,11,0.3)",
      idleBg: "rgba(245,158,11,0.08)",
      idleBorder: "1px solid rgba(245,158,11,0.18)",
      idleColor: "#fcd34d",
    },
  };

  const selected = tones[tone];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: active ? selected.activeBg : selected.idleBg,
        border: active ? selected.activeBorder : selected.idleBorder,
        color: active ? "#ffffff" : selected.idleColor,
      }}
    >
      {label}
    </button>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(userId: string, role: RoleType) {
    setUpdatingUserId(userId);
    setFeedback(null);

    try {
      const ok = await updateUserRole(userId, role);

      if (ok) {
        setFeedback({
          type: "success",
          message: "User role updated successfully.",
        });
        await load();
      } else {
        setFeedback({
          type: "error",
          message: "Failed to update role.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Something went wrong while updating role.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((u) => {
      const name = u.name?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const branch = u.branch?.toLowerCase() || "";
      return (
        name.includes(query) ||
        email.includes(query) ||
        branch.includes(query)
      );
    });
  }, [users, search]);

  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalClubAdmins = users.filter((u) => u.role === "club_admin").length;
  const totalSuperAdmins = users.filter((u) => u.role === "super_admin").length;

  return (
    <div className="min-h-dvh pb-24">
      <div className="pt-12 px-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(56,189,248,0.10)",
              border: "1px solid rgba(56,189,248,0.22)",
            }}
          >
            <Users size={18} className="text-cyan-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="text-xl font-extrabold text-white"
              style={{ letterSpacing: "-0.025em" }}
            >
              Admin Users
            </h1>
            <p className="text-[11px] text-white/35">
              Search users and manage platform roles
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <RefreshCw
              size={16}
              className={`text-white/60 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div
            className="rounded-2xl py-3 text-center"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.18)",
            }}
          >
            <p className="text-lg font-black text-emerald-300">{totalStudents}</p>
            <p className="text-[10px] font-bold text-emerald-300/70">Students</p>
          </div>

          <div
            className="rounded-2xl py-3 text-center"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.18)",
            }}
          >
            <p className="text-lg font-black text-indigo-300">{totalClubAdmins}</p>
            <p className="text-[10px] font-bold text-indigo-300/70">Club Admins</p>
          </div>

          <div
            className="rounded-2xl py-3 text-center"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.18)",
            }}
          >
            <p className="text-lg font-black text-amber-300">{totalSuperAdmins}</p>
            <p className="text-[10px] font-bold text-amber-300/70">Super Admins</p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Search size={15} className="text-white/25 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or branch..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-white/30 hover:text-white transition-colors"
            >
              <AlertCircle size={14} />
            </button>
          )}
        </div>

        {feedback && (
          <div
            className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{
              background:
                feedback.type === "success"
                  ? "rgba(16,185,129,0.08)"
                  : "rgba(244,63,94,0.08)",
              border:
                feedback.type === "success"
                  ? "1px solid rgba(16,185,129,0.18)"
                  : "1px solid rgba(244,63,94,0.18)",
            }}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
            )}
            <p
              className={`text-[12px] font-semibold ${
                feedback.type === "success"
                  ? "text-emerald-300"
                  : "text-rose-300"
              }`}
            >
              {feedback.message}
            </p>
          </div>
        )}
      </div>

      <div className="px-4">
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-white/40">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <div
              className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Search size={22} className="text-white/20" />
            </div>
            <p className="text-sm font-bold text-white/40">No users found</p>
            <p className="text-[12px] text-white/20 mt-1">
              Try a different name, email, or branch
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredUsers.map((u) => {
              const roleMeta = getRoleStyles(u.role);
              const RoleIcon = roleMeta.icon;
              const isUpdating = updatingUserId === u.id;

              return (
                <div
                  key={u.id}
                  className="rounded-3xl p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar src={u.avatarUrl} name={u.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-white truncate">
                        {u.name}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 min-w-0">
                        <Mail size={11} className="text-white/25 flex-shrink-0" />
                        <p className="text-[11px] text-white/45 truncate">
                          {u.email}
                        </p>
                      </div>

                      <p className="text-[11px] text-white/30 mt-1">
                        {u.branch || "Branch not set"} · {u.year || "Year not set"}
                      </p>
                    </div>

                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl flex-shrink-0"
                      style={{
                        background: roleMeta.bg,
                        border: roleMeta.border,
                      }}
                    >
                      <RoleIcon size={11} style={{ color: roleMeta.color }} />
                      <span className={`text-[10px] font-extrabold ${roleMeta.text}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-3">
                      Change Role
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <RoleActionButton
                        label="Make Student"
                        tone="emerald"
                        active={u.role === "student"}
                        disabled={isUpdating}
                        onClick={() => changeRole(u.id, "student")}
                      />

                      <RoleActionButton
                        label="Make Club Admin"
                        tone="indigo"
                        active={u.role === "club_admin"}
                        disabled={isUpdating}
                        onClick={() => changeRole(u.id, "club_admin")}
                      />

                      <RoleActionButton
                        label="Make Super Admin"
                        tone="amber"
                        active={u.role === "super_admin"}
                        disabled={isUpdating}
                        onClick={() => changeRole(u.id, "super_admin")}
                      />
                    </div>

                    {isUpdating && (
                      <p className="text-[11px] text-white/35 mt-3 font-semibold">
                        Updating role...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}