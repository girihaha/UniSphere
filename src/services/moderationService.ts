import { ModerationItem, Post, PostStatus, ApprovalStep } from '../types';
import { api } from '../lib/api';
import { mockPendingPosts, buildWorkflow } from '../data/moderation';

function toModerationItem(p: (typeof mockPendingPosts)[0]): ModerationItem {
  return {
    id: p.id,
    post: p.feedItem as Post,
    status: p.status,
    submittedAt: p.submittedAt,
    submittedBy: p.submittedBy,
    submittedByRole: p.submittedByRole,
    rejectionReason: p.rejectionReason,
    workflow: p.workflow,
    currentStep: p.currentStep,
  };
}

export async function getModerationQueue(
  status?: PostStatus
): Promise<ModerationItem[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await api.get<{ data: ModerationItem[] }>(`/moderation${params}`);
      return response.data;
    } catch (err) {
      console.error('getModerationQueue failed, falling back to mock data', err);
    }
  }

  const items = mockPendingPosts.map(toModerationItem);
  if (!status) return items;
  return items.filter((item) => item.status === status);
}

export async function getMySubmissions(): Promise<ModerationItem[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: ModerationItem[] }>('/moderation/my-posts');
      return response.data;
    } catch (err) {
      console.error('getMySubmissions failed, falling back to mock data', err);
    }
  }

  return [];
}

export async function submitPostForReview(
  post: Post,
  submittedBy: string,
  submittedByRole: string
): Promise<{ item?: ModerationItem; error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.post<{ data: ModerationItem }>('/moderation/submit', {
        post,
        submittedBy,
        submittedByRole,
      });
      return { item: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit post';
      return { error: message };
    }
  }

  const firstStep: ApprovalStep =
    post.type === 'clubs'
      ? 'club_verification'
      : post.type === 'news'
      ? 'journalism_approval'
      : 'super_admin_approval';

  const item: ModerationItem = {
    id: Date.now(),
    post: { ...post, id: Date.now() },
    status: 'pending',
    submittedAt: 'Just now',
    submittedBy,
    submittedByRole,
    workflow: buildWorkflow(post.type, firstStep),
    currentStep: firstStep,
  };
  return { item };
}

export async function approvePost(
  moderationId: number
): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/moderation/${moderationId}/approve`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve post';
      return { error: message };
    }
  }

  return {};
}

export async function rejectPost(
  moderationId: number,
  reason?: string
): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/moderation/${moderationId}/reject`, { reason });
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject post';
      return { error: message };
    }
  }

  return {};
}
