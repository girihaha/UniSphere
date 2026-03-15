import type { Notification as PrismaNotification } from "@prisma/client";
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

function formatNotification(record: PrismaNotification) {
  return {
    id: record.id,
    type: record.type as NotificationType,
    read: record.read,
    timestamp: record.timestamp,
    timestampMs: Number(record.timestampMs),
    actor: {
      name: record.actorName,
      role: record.actorRole || undefined,
    },
    title: record.message,
    message: record.message,
    meta:
      record.postTitle || record.postId || record.type === "connection_request"
        ? {
            postTitle: record.postTitle || undefined,
            connectionId:
              record.type === "connection_request" ? record.actorId : undefined,
          }
        : undefined,
    actionState:
      record.actionState === "pending" ||
      record.actionState === "accepted" ||
      record.actionState === "declined"
        ? record.actionState
        : undefined,
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
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: {
      timestampMs: "desc",
    },
  });

  return rows.map(formatNotification);
}

export async function getNotificationById(userId: string, id: number) {
  return prisma.notification.findFirst({
    where: {
      id,
      userId,
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
