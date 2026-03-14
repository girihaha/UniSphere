import { Poster } from '../types';
import { api } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function createPoster(payload: {
  title: string;
  description?: string;
  imageUrl?: string;
}): Promise<{ poster?: Poster; error?: string }> {
  if (API_BASE_URL) {
    try {
      const response = await api.post<{ data: Poster }>('/posters', payload);
      return { poster: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create poster';
      return { error: message };
    }
  }

  const mockPoster: Poster = {
    id: `poster_${Date.now()}`,
    title: payload.title,
    description: payload.description,
    imageUrl: payload.imageUrl,
    createdAt: new Date().toISOString(),
    qrLink: generatePosterQrLink(`poster_${Date.now()}`),
  };
  return { poster: mockPoster };
}

export async function getPosterById(id: string): Promise<Poster | null> {
  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Poster }>(`/posters/${id}`);
      return response.data;
    } catch {
      return null;
    }
  }

  return {
    id,
    title: 'Sample Poster',
    description: 'This is a mock poster for development.',
    qrLink: generatePosterQrLink(id),
    createdAt: new Date().toISOString(),
  };
}

export function generatePosterQrLink(posterId: string): string {
  const base = API_BASE_URL || 'https://unisphere.app';
  return `${base}/posters/${posterId}`;
}

export async function getMyPosters(): Promise<Poster[]> {
  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Poster[] }>('/posters/mine');
      return response.data;
    } catch (err) {
      console.error('getMyPosters failed', err);
    }
  }

  return [];
}
