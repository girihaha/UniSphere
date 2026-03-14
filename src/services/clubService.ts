import { Club } from '../types';
import { api } from '../lib/api';

export const categories = [
  'All',
  'Technology',
  'Design',
  'Entrepreneurship',
  'Culture',
  'Sports',
];

/* -------------------------------- */
/* Public club endpoints            */
/* -------------------------------- */

export async function getClubs(): Promise<Club[]> {
  try {
    const response = await api.get<{ data: Club[] }>('/clubs');
    return response.data;
  } catch (err) {
    console.error('getClubs failed', err);
    return [];
  }
}

export async function getClubById(id: number): Promise<Club | null> {
  try {
    const response = await api.get<{ data: Club }>(`/clubs/${id}`);
    return response.data;
  } catch (err) {
    console.error('getClubById failed', err);
    return null;
  }
}

export async function followClub(clubId: number): Promise<{ error?: string }> {
  try {
    await api.post(`/clubs/${clubId}/follow`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to follow club';
    return { error: message };
  }
}

export async function unfollowClub(clubId: number): Promise<{ error?: string }> {
  try {
    await api.delete(`/clubs/${clubId}/follow`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to unfollow club';
    return { error: message };
  }
}

export async function getFollowedClubIds(): Promise<number[]> {
  try {
    const response = await api.get<{ data: number[] }>('/clubs/followed');
    return response.data;
  } catch (err) {
    console.error('getFollowedClubIds failed', err);
    return [];
  }
}

/* -------------------------------- */
/* Super admin club management      */
/* -------------------------------- */

export interface CreateClubPayload {
  name: string;
  username: string;
  description: string;
  category: string;
  avatar?: string;
  coverImage?: string;
  tags?: string[];
  verified?: boolean;
  isOfficial?: boolean;
}

export async function createClub(payload: CreateClubPayload): Promise<Club | null> {
  try {
    const response = await api.post<{ data: Club }>('/clubs/admin/create', payload);
    return response.data;
  } catch (err) {
    console.error('createClub failed', err);
    return null;
  }
}

export async function assignClubAdmin(
  clubId: number,
  userId: string
): Promise<{ error?: string }> {
  try {
    await api.patch(`/clubs/admin/${clubId}/assign-admin`, { userId });
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to assign club admin';
    return { error: message };
  }
}

/* -------------------------------- */
/* Club admin dashboard             */
/* -------------------------------- */

export async function getManagedClubs(): Promise<Club[]> {
  try {
    const response = await api.get<{ data: Club[] }>('/clubs/managed');
    return response.data;
  } catch (err) {
    console.error('getManagedClubs failed', err);
    return [];
  }
}