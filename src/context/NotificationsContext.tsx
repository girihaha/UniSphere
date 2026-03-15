import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  respondToConnectionNotification,
} from '../services/notificationService';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  respondToConnection: (id: number, action: 'accepted' | 'declined') => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const result = await markNotificationRead(id);

    if (result.error) {
      console.error('markAsRead failed:', result.error);
      await refreshNotifications();
    }
  };

  const markAllAsRead = async () => {
    const previous = notifications;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const result = await markAllNotificationsRead();

    if (result.error) {
      console.error('markAllAsRead failed:', result.error);
      setNotifications(previous);
      await refreshNotifications();
    }
  };

  const respondToConnection = async (
    id: number,
    action: 'accepted' | 'declined'
  ) => {
    const previous = notifications;

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, read: true, actionState: action }
          : n
      )
    );

    const result = await respondToConnectionNotification(id, action);

    if (result.error) {
      console.error('respondToConnection failed:', result.error);
      setNotifications(previous);
      await refreshNotifications();
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        respondToConnection,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
