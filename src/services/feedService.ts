import { Post, CreatePostPayload, PaginatedResponse } from '../types';
import { api } from '../lib/api';

export async function getPosts(
  filter?: 'news' | 'clubs' | 'students',
  page = 1,
  limit = 20
): Promise<Post[]> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filter) {
      params.set('type', filter);
    }

    const response = await api.get<PaginatedResponse<Post>>(`/posts?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('getPosts error:', err);
    return [];
  }
}

export async function getPostById(id: number): Promise<Post | null> {
  try {
    const response = await api.get<{ data: Post }>(`/posts/${id}`);
    return response.data;
  } catch (err) {
    console.error('getPostById error:', err);
    return null;
  }
}

export async function getSavedPosts(): Promise<Post[]> {
  try {
    const response = await api.get<PaginatedResponse<Post>>('/posts/saved');
    return response.data;
  } catch (err) {
    console.error('getSavedPosts error:', err);
    return [];
  }
}

export async function createPost(
  payload: CreatePostPayload
): Promise<{ post?: Post; message?: string; error?: string }> {
  try {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('content', payload.content);
    formData.append('type', payload.type);

    if (payload.summary?.trim()) {
      formData.append('summary', payload.summary.trim());
    }

    if (payload.postAs) {
      formData.append('postAs', payload.postAs);
    }

    if (payload.kind) {
      formData.append('kind', payload.kind);
    }

    if (payload.clubId !== undefined && payload.clubId !== null) {
      formData.append('clubId', String(payload.clubId));
    }

    if (payload.eventDate?.trim()) {
      formData.append('eventDate', payload.eventDate.trim());
    }

    if (payload.eventTime?.trim()) {
      formData.append('eventTime', payload.eventTime.trim());
    }

    if (payload.eventLocation?.trim()) {
      formData.append('eventLocation', payload.eventLocation.trim());
    }

    if (payload.registerLink?.trim()) {
      formData.append('registerLink', payload.registerLink.trim());
    }

    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }

    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/posts`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Post creation failed' };
    }

    return {
      post: data.data,
      message: data.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Post creation failed';
    console.error('createPost error:', err);
    return { error: message };
  }
}

export async function getClubReviewQueue(): Promise<Post[]> {
  try {
    const response = await api.get<PaginatedResponse<Post>>('/posts/moderation/club');
    return response.data;
  } catch (err) {
    console.error('getClubReviewQueue error:', err);
    return [];
  }
}

export async function getAdminReviewQueue(): Promise<Post[]> {
  try {
    const response = await api.get<PaginatedResponse<Post>>('/posts/moderation/admin');
    return response.data;
  } catch (err) {
    console.error('getAdminReviewQueue error:', err);
    return [];
  }
}

export async function approvePostAtClubLevel(
  postId: number
): Promise<{ post?: Post; message?: string; error?: string }> {
  try {
    const response = await api.patch<{ data: Post; message?: string }>(
      `/posts/moderation/${postId}/club-approve`
    );

    return {
      post: response.data,
      message: response.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to approve post';
    console.error('approvePostAtClubLevel error:', err);
    return { error: message };
  }
}

export async function approvePostAtAdminLevel(
  postId: number
): Promise<{ post?: Post; message?: string; error?: string }> {
  try {
    const response = await api.patch<{ data: Post; message?: string }>(
      `/posts/moderation/${postId}/admin-approve`
    );

    return {
      post: response.data,
      message: response.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to approve post';
    console.error('approvePostAtAdminLevel error:', err);
    return { error: message };
  }
}

export async function rejectPostAtClubLevel(
  postId: number,
  reason: string
): Promise<{ post?: Post; message?: string; error?: string }> {
  try {
    const response = await api.patch<{ data: Post; message?: string }>(
      `/posts/moderation/${postId}/club-reject`,
      { reason }
    );

    return {
      post: response.data,
      message: response.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reject post';
    console.error('rejectPostAtClubLevel error:', err);
    return { error: message };
  }
}

export async function rejectPostAtAdminLevel(
  postId: number,
  reason: string
): Promise<{ post?: Post; message?: string; error?: string }> {
  try {
    const response = await api.patch<{ data: Post; message?: string }>(
      `/posts/moderation/${postId}/admin-reject`,
      { reason }
    );

    return {
      post: response.data,
      message: response.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reject post';
    console.error('rejectPostAtAdminLevel error:', err);
    return { error: message };
  }
}

export async function likePost(postId: number): Promise<{ error?: string }> {
  try {
    await api.post(`/posts/${postId}/like`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to like post';
    return { error: message };
  }
}

export async function unlikePost(postId: number): Promise<{ error?: string }> {
  try {
    await api.delete(`/posts/${postId}/like`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to unlike post';
    return { error: message };
  }
}

export async function savePost(postId: number): Promise<{ error?: string }> {
  try {
    await api.post(`/posts/${postId}/save`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save post';
    return { error: message };
  }
}

export async function unsavePost(postId: number): Promise<{ error?: string }> {
  try {
    await api.delete(`/posts/${postId}/save`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to unsave post';
    return { error: message };
  }
}

export async function deletePost(postId: number): Promise<{ error?: string; message?: string }> {
  try {
    const response = await api.delete<{ message?: string }>(`/posts/${postId}`);
    return {
      message: response.message || 'Post deleted successfully',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete post';
    return { error: message };
  }
}
