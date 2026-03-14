import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  assignClubAdmin,
  createClub,
  followClub,
  getClubById,
  getClubs,
  getFollowedClubIds,
  getManagedClubsForAdmin,
  unfollowClub,
} from "../services/clubService";
import { getApprovedPostsByClubId } from "../services/postService";

export async function listClubs(req: AuthRequest, res: Response) {
  const clubs = await getClubs(req.user?.userId);

  return res.status(200).json({
    data: clubs,
    page: 1,
    limit: clubs.length,
    total: clubs.length,
  });
}

export async function getSingleClub(req: AuthRequest, res: Response) {
  const clubId = Number(req.params.id);

  if (Number.isNaN(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  const club = await getClubById(clubId, req.user?.userId);

  if (!club) {
    return res.status(404).json({ message: "Club not found" });
  }

  const unifiedPosts = await getApprovedPostsByClubId(club.id, req.user?.userId);

  return res.status(200).json({
    data: {
      ...club,
      posts: unifiedPosts,
    },
  });
}

export async function followSingleClub(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const clubId = Number(req.params.id);

  if (Number.isNaN(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  const result = await followClub(req.user.userId, clubId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({ message: "Club followed successfully." });
}

export async function unfollowSingleClub(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const clubId = Number(req.params.id);

  if (Number.isNaN(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  const result = await unfollowClub(req.user.userId, clubId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({ message: "Club unfollowed successfully." });
}

export async function listFollowedClubs(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const followedIds = await getFollowedClubIds(req.user.userId);

  return res.status(200).json({
    data: followedIds,
  });
}

export async function listManagedClubs(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const clubs = await getManagedClubsForAdmin(req.user.userId);

  return res.status(200).json({
    data: clubs,
    page: 1,
    limit: clubs.length,
    total: clubs.length,
  });
}

export async function createNewClub(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await createClub(req.user.userId, {
    name: req.body.name,
    username: req.body.username,
    description: req.body.description,
    category: req.body.category,
    avatar: req.body.avatar,
    coverImage: req.body.coverImage,
    tags: req.body.tags,
    verified: req.body.verified,
    isOfficial: req.body.isOfficial,
  });

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(201).json({
    data: result.club,
    message: "Club created successfully.",
  });
}

export async function assignAdminToClub(req: AuthRequest, res: Response) {
  const clubId = Number(req.params.id);

  if (Number.isNaN(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  const result = await assignClubAdmin(clubId, {
    userId: req.body.userId,
  });

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({
    data: result.club,
    message: "Club admin assigned successfully.",
  });
}