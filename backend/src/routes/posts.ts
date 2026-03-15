import { Router } from "express";
import {
  requireAuth,
  requireClubAdmin,
  requireSuperAdmin,
} from "../middleware/authMiddleware";

import {
  approvePostAtAdminLevel,
  approvePostAtClubLevel,
  createCommentOnPost,
  createNewPost,
  deleteOwnedPost,
  deleteCommentOnPost,
  getSinglePost,
  listMyPosts,
  listSavedPosts,
  likeSinglePost,
  listAdminReviewQueue,
  listAllPostsForModeration,
  listClubReviewQueue,
  listCommentsForPost,
  listPosts,
  rejectPostAtAdminLevel,
  rejectPostAtClubLevel,
  saveSinglePost,
  unlikeSinglePost,
  unsaveSinglePost,
} from "../controllers/postController";

import { upload } from "../config/multer";

const router = Router();

/* ---------------- MODERATION FIRST ---------------- */

router.get(
  "/moderation/all",
  requireAuth,
  requireSuperAdmin,
  listAllPostsForModeration
);

router.get(
  "/moderation/club",
  requireAuth,
  requireClubAdmin,
  listClubReviewQueue
);

router.get(
  "/moderation/admin",
  requireAuth,
  requireSuperAdmin,
  listAdminReviewQueue
);

router.patch(
  "/moderation/:id/club-approve",
  requireAuth,
  requireClubAdmin,
  approvePostAtClubLevel
);

router.patch(
  "/moderation/:id/admin-approve",
  requireAuth,
  requireSuperAdmin,
  approvePostAtAdminLevel
);

router.patch(
  "/moderation/:id/club-reject",
  requireAuth,
  requireClubAdmin,
  rejectPostAtClubLevel
);

router.patch(
  "/moderation/:id/admin-reject",
  requireAuth,
  requireSuperAdmin,
  rejectPostAtAdminLevel
);

/* ---------------- FEED ---------------- */

router.get("/", requireAuth, listPosts);
router.get("/mine", requireAuth, listMyPosts);
router.get("/saved", requireAuth, listSavedPosts);
router.post("/", requireAuth, upload.single("image"), createNewPost);
router.delete("/:id", requireAuth, deleteOwnedPost);

/* ---------------- COMMENTS ---------------- */

router.get("/:id/comments", requireAuth, listCommentsForPost);
router.post("/:id/comments", requireAuth, createCommentOnPost);
router.delete("/:id/comments/:commentId", requireAuth, deleteCommentOnPost);

/* ---------------- SINGLE POST + INTERACTIONS ---------------- */

router.get("/:id", requireAuth, getSinglePost);

router.post("/:id/like", requireAuth, likeSinglePost);
router.delete("/:id/like", requireAuth, unlikeSinglePost);

router.post("/:id/save", requireAuth, saveSinglePost);
router.delete("/:id/save", requireAuth, unsaveSinglePost);

export default router;
