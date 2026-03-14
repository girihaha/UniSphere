import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  respondToConnectionNotification,
} from "../services/notificationService";

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

  await respondToConnectionNotification(req.user.userId, id, action);

  return res.status(200).json({ success: true });
};