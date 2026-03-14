import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  listNotifications,
  markSingleNotificationRead,
  markEveryNotificationRead,
  respondToConnectionRequestNotification,
} from "../controllers/notificationController";

const router = Router();

router.get("/", requireAuth, listNotifications);
router.patch("/:id/read", requireAuth, markSingleNotificationRead);
router.post("/read-all", requireAuth, markEveryNotificationRead);
router.post("/:id/respond", requireAuth, respondToConnectionRequestNotification);

export default router;