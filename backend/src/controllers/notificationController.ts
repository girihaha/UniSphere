import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getNotificationsForUser,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  respondToConnectionNotification,
} from "../services/notificationService";
import {
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "../services/networkService";

export const listNotifications = async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = await getNotificationsForUser(req.user.userId);

  return res.status(200).json({ data });
};

export const markSingleNotificationRead = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid notification id" });
  }

  await markNotificationRead(req.user.userId, id);

  return res.status(200).json({ success: true });
};

export const markEveryNotificationRead = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await markAllNotificationsRead(req.user.userId);

  return res.status(200).json({ success: true });
};

export const respondToConnectionRequestNotification = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = Number(req.params.id);
  const action = req.body?.action as "accepted" | "declined" | undefined;

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid notification id" });
  }

  if (action !== "accepted" && action !== "declined") {
    return res.status(400).json({ message: "Invalid action" });
  }

  const notification = await getNotificationById(req.user.userId, id);

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  if (notification.type !== "connection_request") {
    return res.status(400).json({ message: "This notification cannot be responded to" });
  }

  if (notification.actionState && notification.actionState !== "pending") {
    return res.status(400).json({ message: "Connection request already handled" });
  }

  const result =
    action === "accepted"
      ? await acceptConnectionRequest(req.user.userId, notification.actorId)
      : await rejectConnectionRequest(req.user.userId, notification.actorId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  await respondToConnectionNotification(req.user.userId, id, action);

  return res.status(200).json({ success: true });
};
