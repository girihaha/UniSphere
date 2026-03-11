import { User, SocialLink, Achievement } from '../types';
import { api } from '../lib/api';
import { studentProfile, socialLinks as mockSocialLinks, recentConnections as mockRecentConnections } from '../data/profile';

export interface RecentConnection {
  id: number;
  name: string;
  branch: string;
  avatarUrl?: string;
}

export async function getUserProfile(userId?: string): Promise<User | null> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const path = userId ? `/users/${userId}` : '/users/me';
      const response = await api.get<{ data: User }>(path);
      return response.data;
    } catch (err) {
      console.error('getUserProfile failed, falling back to mock data', err);
    }
  }

  return {
    name: studentProfile.name,
    email: studentProfile.email,
    regNumber: studentProfile.regNumber,
    branch: studentProfile.branch,
    degree: studentProfile.degree,
    year: studentProfile.year,
    cgpa: studentProfile.cgpa,
    bio: studentProfile.bio,
    avatarUrl: studentProfile.avatarUrl,
    role: 'student',
    connections: studentProfile.connections,
    posts: studentProfile.posts,
    notes: studentProfile.notes,
    clubs: studentProfile.clubs,
  };
}

export async function updateUserProfile(
  updates: Partial<User>
): Promise<{ user?: User; error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.patch<{ data: User }>('/users/me', updates);
      return { user: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      return { error: message };
    }
  }

  return { user: updates as User };
}

export async function getSocialLinks(userId?: string): Promise<SocialLink[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const path = userId ? `/users/${userId}/social-links` : '/users/me/social-links';
      const response = await api.get<{ data: SocialLink[] }>(path);
      return response.data;
    } catch (err) {
      console.error('getSocialLinks failed, falling back to mock data', err);
    }
  }

  return mockSocialLinks;
}

export async function updateSocialLinks(
  links: SocialLink[]
): Promise<{ links?: SocialLink[]; error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.put<{ data: SocialLink[] }>('/users/me/social-links', { links });
      return { links: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update social links';
      return { error: message };
    }
  }

  return { links };
}

export async function getAchievements(userId?: string): Promise<Achievement[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const path = userId ? `/users/${userId}/achievements` : '/users/me/achievements';
      const response = await api.get<{ data: Achievement[] }>(path);
      return response.data;
    } catch (err) {
      console.error('getAchievements failed, falling back to mock data', err);
    }
  }

  return [
    { id: 'hackathon', title: 'Hackathon\nWinner', subtitle: 'HackCampus 2024', color: 'text-amber-400', bgFrom: 'from-amber-500/20', bgTo: 'to-orange-500/10' },
    { id: 'deans-list', title: "Dean's List", subtitle: 'Sem 5', color: 'text-blue-400', bgFrom: 'from-blue-500/20', bgTo: 'to-cyan-500/10' },
    { id: 'club-lead', title: 'Club\nLeader', subtitle: 'DevSoc 2024', color: 'text-emerald-400', bgFrom: 'from-emerald-500/20', bgTo: 'to-teal-500/10' },
    { id: 'top-contrib', title: 'Top\nContrib', subtitle: 'Open Source', color: 'text-rose-400', bgFrom: 'from-rose-500/20', bgTo: 'to-pink-500/10' },
  ];
}

export async function getRecentConnections(userId?: string): Promise<RecentConnection[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const path = userId ? `/users/${userId}/connections/recent` : '/users/me/connections/recent';
      const response = await api.get<{ data: RecentConnection[] }>(path);
      return response.data;
    } catch (err) {
      console.error('getRecentConnections failed, falling back to mock data', err);
    }
  }

  return mockRecentConnections;
}
