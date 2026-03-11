import { Notification } from '../types';
import { api } from '../lib/api';
import { mockNotifications } from '../data/notifications';

export async function getNotifications(): Promise<Notification[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Notification[] }>('/notifications');
      return response.data;
    } catch (err) {
      console.error('getNotifications failed, falling back to mock data', err);
    }
  }

  return mockNotifications;
}

export async function markNotificationRead(id: number): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.patch(`/notifications/${id}/read`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark as read';
      return { error: message };
    }
  }

  return {};
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post('/notifications/read-all');
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all as read';
      return { error: message };
    }
  }

  return {};
}

export async function respondToConnectionNotification(
  notificationId: number,
  action: 'accepted' | 'declined'
): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/notifications/${notificationId}/respond`, { action });
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to respond';
      return { error: message };
    }
  }

  return {};
}
