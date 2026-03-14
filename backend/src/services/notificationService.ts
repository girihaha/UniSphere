import { prisma } from "../lib/prisma";

export type NotificationType =
  | "connection_request"
  | "post_approved"
  | "post_rejected"
  | "club_post"
  | "network_note"
  | "mention"
  | "interaction";

export interface NotificationActor {
  id: string;
  name: string;
  role?: string;
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  message: string;
  actor: NotificationActor;
  actionState?: "pending" | "accepted" | "declined";
  meta?: {
    postId?: number;
    postTitle?: string;
  };
}

export async function createNotification(notification: NotificationPayload) {
  const now = Date.now();

  return prisma.notification.create({
    data: {
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      actorId: notification.actor.id,
      actorName: notification.actor.name,
      actorRole: notification.actor.role || null,
      read: false,
      timestamp: "Just now",
      timestampMs: BigInt(now),
      actionState: notification.actionState || null,
      postId: notification.meta?.postId ?? null,
      postTitle: notification.meta?.postTitle ?? null,
    },
  });
}

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: {
      timestampMs: "desc",
    },
  });
}

export async function markNotificationRead(userId: string, id: number) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      read: true,
    },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId },
    data: {
      read: true,
    },
  });
}

export async function respondToConnectionNotification(
  userId: string,
  id: number,
  action: "accepted" | "declined"
) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      read: true,
      actionState: action,
    },
  });
}