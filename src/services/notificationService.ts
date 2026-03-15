import { Notification } from '../types';
import { api } from '../lib/api';

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<{ data: Notification[] }>('/notifications');
  return response.data || [];
}

export async function markNotificationRead(id: number): Promise<{ error?: string }> {
  try {
    await api.patch(`/notifications/${id}/read`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to mark as read';
    return { error: message };
  }
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
  try {
    await api.post('/notifications/read-all');
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to mark all as read';
    return { error: message };
  }
}

export async function respondToConnectionNotification(
  notificationId: number,
  action: 'accepted' | 'declined'
): Promise<{ error?: string }> {
  try {
    await api.post(`/notifications/${notificationId}/respond`, { action });
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to respond';
    return { error: message };
  }
}
