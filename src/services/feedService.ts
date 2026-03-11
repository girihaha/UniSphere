import { Post, CreatePostPayload, PaginatedResponse } from '../types';
import { api } from '../lib/api';
import { feedItems } from '../data/feed';

export async function getPosts(
  filter?: 'news' | 'clubs' | 'students',
  page = 1,
  limit = 20
): Promise<Post[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filter) params.set('type', filter);
      const response = await api.get<PaginatedResponse<Post>>(`/posts?${params}`);
      return response.data;
    } catch (err) {
      console.error('getPosts failed, falling back to mock data', err);
    }
  }

  const items = feedItems as Post[];
  if (!filter) return items;
  return items.filter((item) => item.type === filter);
}

export async function getPostById(id: number): Promise<Post | null> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Post }>(`/posts/${id}`);
      return response.data;
    } catch {
      return null;
    }
  }

  return (feedItems as Post[]).find((item) => item.id === id) ?? null;
}

export async function createPost(
  payload: CreatePostPayload
): Promise<{ post?: Post; error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.post<{ data: Post }>('/posts', payload);
      return { post: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      return { error: message };
    }
  }

  const mockPost: Post = {
    id: Date.now(),
    ...payload,
    author: payload.title,
    authorRole: 'Student',
    authorName: 'You',
    time: 'Just now',
    likes: 0,
    comments: 0,
    saved: false,
    liked: false,
  };
  return { post: mockPost };
}

export async function likePost(postId: number): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/posts/${postId}/like`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to like post';
      return { error: message };
    }
  }

  return {};
}

export async function unlikePost(postId: number): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.delete(`/posts/${postId}/like`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unlike post';
      return { error: message };
    }
  }

  return {};
}

export async function savePost(postId: number): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/posts/${postId}/save`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save post';
      return { error: message };
    }
  }

  return {};
}

export async function unsavePost(postId: number): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.delete(`/posts/${postId}/save`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unsave post';
      return { error: message };
    }
  }

  return {};
}
