import { User, SocialLink, Achievement } from '../types';
import { api } from '../lib/api';

export interface RecentConnection {
  id: number;
  name: string;
  branch: string;
  avatarUrl?: string;
}

export async function getUserProfile(userId?: string): Promise<User | null> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    const path = userId ? `/users/${userId}` : '/users/me';
    const response = await api.get<{ data: User }>(path);
    return response.data;
  }

  return null;
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

  return { error: 'Backend not connected' };
}

export async function getSocialLinks(_userId?: string): Promise<SocialLink[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: SocialLink[] }>('/users/me/social-links');
      return response.data || [];
    } catch (err) {
      console.error('getSocialLinks failed', err);
      return [];
    }
  }

  return [];
}

export async function updateSocialLinks(
  links: SocialLink[]
): Promise<{ links?: SocialLink[]; error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.put<{ data: SocialLink[] }>('/users/me/social-links', { links });
      return { links: response.data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update social links';
      return { error: message };
    }
  }

  return { error: 'Backend not connected' };
}

export async function getAchievements(_userId?: string): Promise<Achievement[]> {
  return [];
}

export async function getRecentConnections(_userId?: string): Promise<RecentConnection[]> {
  return [];
}