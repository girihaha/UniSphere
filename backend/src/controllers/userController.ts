import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { formatAcademicYear } from "../models/userModel";
import {
  getCurrentUserById,
  getRawUserById,
  getSocialLinksByUserId,
  listUsersForAdmin,
  updateCurrentUserById,
  updateSocialLinksByUserId,
  updateUserRoleById,
} from "../services/authService";
import {
  acceptConnectionRequest,
  createNetworkNoteForUser,
  getConnectionCount,
  getConnectionsForUser,
  getDiscoverUsers,
  getIncomingRequestsForUser,
  getMutualCount,
  getNetworkNotesForUser,
  getRelationshipStatus,
  rejectConnectionRequest,
  sendConnectionRequest,
} from "../services/networkService";

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await getCurrentUserById(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const connections = await getConnectionCount(req.user.userId);

  return res.status(200).json({
    data: {
      ...user,
      connections,
    },
  });
}

export async function updateMe(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const updatedUser = await updateCurrentUserById(req.user.userId, req.body);

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const connections = await getConnectionCount(req.user.userId);

  return res.status(200).json({
    data: {
      ...updatedUser,
      connections,
    },
  });
}

export async function getMySocialLinks(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const links = await getSocialLinksByUserId(req.user.userId);
  return res.status(200).json({ data: links });
}

export async function updateMySocialLinks(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const links = Array.isArray(req.body?.links) ? req.body.links : [];
  const updated = await updateSocialLinksByUserId(req.user.userId, links);

  return res.status(200).json({ data: updated });
}

export async function discoverUsers(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = await getDiscoverUsers(req.user.userId);
  return res.status(200).json({ data });
}

export async function listConnections(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = await getConnectionsForUser(req.user.userId);
  return res.status(200).json({ data });
}

export async function listRequests(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = await getIncomingRequestsForUser(req.user.userId);
  return res.status(200).json({ data });
}

export async function getUserProfileById(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const currentUserId = req.user.userId;
  const targetUserId = req.params.id;

  const user = await getRawUserById(targetUserId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const [socialLinks, relationshipStatus, mutual, connectionsCount] = await Promise.all([
    getSocialLinksByUserId(targetUserId),
    getRelationshipStatus(currentUserId, targetUserId),
    getMutualCount(currentUserId, targetUserId),
    getConnectionCount(targetUserId),
  ]);

  return res.status(200).json({
    data: {
      id: user.id,
      name: user.name,
      branch: user.branch,
      degree: (user as any).degree || "SRM Program",
      year: formatAcademicYear(user.year),
      avatarUrl: user.avatarUrl || "",
      bio: user.bio || "",
      posts: (user as any).posts ?? 0,
      clubs: (user as any).clubs ?? 0,
      connectionsCount,
      mutual,
      relationshipStatus,
      instagram:
        socialLinks.find((link: any) => link.type === "instagram" || link.id === "instagram")
          ?.handle || "",
      linkedin:
        socialLinks.find((link: any) => link.type === "linkedin" || link.id === "linkedin")
          ?.handle || "",
      github:
        socialLinks.find((link: any) => link.type === "github" || link.id === "github")?.handle ||
        "",
      portfolio:
        socialLinks.find((link: any) => link.type === "portfolio" || link.id === "portfolio")
          ?.handle || "",
    },
  });
}

export async function connectToUser(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const targetUserId = req.params.id;
  const result = await sendConnectionRequest(
    req.user.userId,
    targetUserId,
    req.body?.message
  );

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({
    success: true,
    message: "Connection request sent",
  });
}

export async function acceptUserRequest(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const requesterId = req.params.id;
  const result = await acceptConnectionRequest(req.user.userId, requesterId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({
    success: true,
    message: "Connection request accepted",
  });
}

export async function rejectUserRequest(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const requesterId = req.params.id;
  const result = await rejectConnectionRequest(req.user.userId, requesterId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({
    success: true,
    message: "Connection request rejected",
  });
}

export async function listNetworkNotes(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = await getNetworkNotesForUser(req.user.userId);
  return res.status(200).json({ data });
}

export async function createNetworkNote(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await createNetworkNoteForUser(
    req.user.userId,
    req.body?.text || "",
    req.body?.durationSeconds
  );

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  const data = await getNetworkNotesForUser(req.user.userId);
  return res.status(201).json({ data });
}

export async function adminListUsers(_req: AuthRequest, res: Response) {
  const data = await listUsersForAdmin();
  return res.status(200).json({ data });
}

export async function adminUpdateUserRole(req: AuthRequest, res: Response) {
  const userId = req.params.id;
  const role = req.body?.role;

  const result = await updateUserRoleById(userId, role);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({
    data: result.user,
    message: "User role updated successfully.",
  });
}
