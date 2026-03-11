import { Comment } from '../types';
import { api } from '../lib/api';

const mockComments: Record<number, Comment[]> = {};

export async function getComments(postId: number): Promise<Comment[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Comment[] }>(`/posts/${postId}/comments`);
      return response.data;
    } catch (err) {
      console.error('getComments failed, falling back to mock data', err);
    }
  }

  return mockComments[postId] ?? [];
}

export async function createComment(
  postId: number,
  text: string
): Promise<{ comment?: Comment; error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.post<{ data: Comment }>(`/posts/${postId}/comments`, { text });
      return { comment: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post comment';
      return { error: message };
    }
  }

  const comment: Comment = {
    id: Date.now(),
    postId,
    authorName: 'You',
    text,
    time: 'Just now',
    timestampMs: Date.now(),
  };

  mockComments[postId] = [comment, ...(mockComments[postId] ?? [])];
  return { comment };
}

export async function deleteComment(
  postId: number,
  commentId: number
): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment';
      return { error: message };
    }
  }

  if (mockComments[postId]) {
    mockComments[postId] = mockComments[postId].filter((c) => c.id !== commentId);
  }
  return {};
}
