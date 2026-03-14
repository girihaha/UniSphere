export type UserRole = "student" | "club_admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  regNumber: string;
  branch: string;
  degree: string;
  year: string;
  role: UserRole;
  bio?: string;
  avatarUrl?: string;
  cgpa?: string;
  connections?: number;
  posts?: number;
  notes?: number;
  clubs?: number;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  regNumber: string;
  branch: string;
  year: string;
  role: UserRole;
}

export function sanitizeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    regNumber: user.regNumber,
    branch: user.branch,
    degree: user.degree,
    year: user.year,
    role: user.role,
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
    cgpa: user.cgpa ?? "",
    connections: user.connections ?? 0,
    posts: user.posts ?? 0,
    notes: user.notes ?? 0,
    clubs: user.clubs ?? 0,
  };
}