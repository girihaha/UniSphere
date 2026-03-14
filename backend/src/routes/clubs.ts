import { Router } from "express";
import {
  requireAuth,
  requireClubAdmin,
  requireSuperAdmin,
} from "../middleware/authMiddleware";
import {
  assignAdminToClub,
  createNewClub,
  followSingleClub,
  getSingleClub,
  listClubs,
  listFollowedClubs,
  listManagedClubs,
  unfollowSingleClub,
} from "../controllers/clubController";

console.log("club route handlers", {
  assignAdminToClub: typeof assignAdminToClub,
  createNewClub: typeof createNewClub,
  followSingleClub: typeof followSingleClub,
  getSingleClub: typeof getSingleClub,
  listClubs: typeof listClubs,
  listFollowedClubs: typeof listFollowedClubs,
  listManagedClubs: typeof listManagedClubs,
  unfollowSingleClub: typeof unfollowSingleClub,
});

const router = Router();

router.get("/", requireAuth, listClubs);
router.get("/followed", requireAuth, listFollowedClubs);
router.get("/managed", requireAuth, requireClubAdmin, listManagedClubs);
router.get("/:id", requireAuth, getSingleClub);

router.post("/:id/follow", requireAuth, followSingleClub);
router.delete("/:id/follow", requireAuth, unfollowSingleClub);

router.post("/admin/create", requireAuth, requireSuperAdmin, createNewClub);
router.patch(
  "/admin/:id/assign-admin",
  requireAuth,
  requireSuperAdmin,
  assignAdminToClub
);

export default router;