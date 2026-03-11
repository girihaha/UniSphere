import { Club } from '../types';
import { api } from '../lib/api';
import { clubs } from '../data/clubs';

export { categories } from '../data/clubs';

export async function getClubs(): Promise<Club[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Club[] }>('/clubs');
      return response.data;
    } catch (err) {
      console.error('getClubs failed, falling back to mock data', err);
    }
  }

  return clubs as Club[];
}

export async function getClubById(id: number): Promise<Club | null> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Club }>(`/clubs/${id}`);
      return response.data;
    } catch {
      return null;
    }
  }

  return (clubs as Club[]).find((c) => c.id === id) ?? null;
}

export async function followClub(clubId: number): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/clubs/${clubId}/follow`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to follow club';
      return { error: message };
    }
  }

  return {};
}

export async function unfollowClub(clubId: number): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.delete(`/clubs/${clubId}/follow`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unfollow club';
      return { error: message };
    }
  }

  return {};
}

export async function getFollowedClubIds(): Promise<number[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: number[] }>('/clubs/followed');
      return response.data;
    } catch {
      return [];
    }
  }

  return [];
}
