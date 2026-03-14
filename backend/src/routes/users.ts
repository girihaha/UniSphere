import { Router } from "express";
import {
  acceptUserRequest,
  adminListUsers,
  adminUpdateUserRole,
  connectToUser,
  createNetworkNote,
  discoverUsers,
  getMe,
  getMySocialLinks,
  getUserProfileById,
  listConnections,
  listNetworkNotes,
  listRequests,
  rejectUserRequest,
  updateMe,
  updateMySocialLinks,
} from "../controllers/userController";
import { requireAuth, requireSuperAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);

router.get("/me/social-links", requireAuth, getMySocialLinks);
router.put("/me/social-links", requireAuth, updateMySocialLinks);

router.get("/discover", requireAuth, discoverUsers);
router.get("/connections", requireAuth, listConnections);
router.get("/requests", requireAuth, listRequests);

router.get("/network/notes", requireAuth, listNetworkNotes);
router.post("/network/notes", requireAuth, createNetworkNote);

/* Super admin user management */
router.get("/admin/all", requireAuth, requireSuperAdmin, adminListUsers);
router.patch("/admin/:id/role", requireAuth, requireSuperAdmin, adminUpdateUserRole);

router.get("/profile/:id", requireAuth, getUserProfileById);

router.post("/:id/connect", requireAuth, connectToUser);
router.post("/:id/accept", requireAuth, acceptUserRequest);
router.post("/:id/reject", requireAuth, rejectUserRequest);

export default router;