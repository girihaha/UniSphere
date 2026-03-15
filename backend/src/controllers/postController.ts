import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  approvePostByClubAdmin,
  approvePostBySuperAdmin,
  createCommentForPost,
  createPost,
  deleteCommentForPost,
  getAllPostsForModeration,
  getCommentsForPost,
  getPendingAdminReviewPosts,
  getPendingClubReviewPosts,
  getPostById,
  getPosts,
  getSavedPosts,
  likePost,
  rejectPost,
  savePost,
  unlikePost,
  unsavePost,
} from "../services/postService";
import { createNotification } from "../services/notificationService";
import { getRawUserById } from "../services/authService";

async function getActorName(userId: string) {
  const user = await getRawUserById(userId);
  return user?.name || "UniSphere Admin";
}

async function getActorRole(userId: string) {
  const user = await getRawUserById(userId);

  if (!user) return "Admin";
  if (user.role === "super_admin") return "Super Admin";
  if (user.role === "club_admin") return "Club Admin";
  return "Student";
}

function buildInlineImage(req: AuthRequest) {
  if (!req.file?.buffer || !req.file.mimetype) {
    return "";
  }

  return `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
}

async function createPostOwnerNotification(
  targetUserId: string | undefined,
  type: "post_approved" | "post_rejected" | "interaction",
  message: string,
  actorUserId: string,
  postId?: number,
  postTitle?: string
) {
  if (!targetUserId || targetUserId === actorUserId) return;

  await createNotification({
    userId: targetUserId,
    type,
    message,
    actor: {
      id: actorUserId,
      name: await getActorName(actorUserId),
      role: await getActorRole(actorUserId),
    },
    meta: {
      postId,
      postTitle,
    },
  });
}

export async function listPosts(req: AuthRequest, res: Response) {
  const type = req.query.type as "news" | "clubs" | "students" | undefined;
  const posts = await getPosts(type, req.user?.userId);

  return res.status(200).json({
    data: posts,
    page: 1,
    limit: posts.length,
    total: posts.length,
  });
}

export async function getSinglePost(req: AuthRequest, res: Response) {
  const postId = Number(req.params.id);
  const post = await getPostById(postId, req.user?.userId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  return res.status(200).json({ data: post });
}

export async function listSavedPosts(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const posts = await getSavedPosts(req.user.userId);

  return res.status(200).json({
    data: posts,
    page: 1,
    limit: posts.length,
    total: posts.length,
  });
}

export async function createNewPost(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const image = req.file ? buildInlineImage(req) : "";

  const eventDate = req.body.eventDate?.trim?.() || "";
  const eventTime = req.body.eventTime?.trim?.() || "";
  const eventLocation = req.body.eventLocation?.trim?.() || "";
  const registerLink = req.body.registerLink?.trim?.() || "";

  const hasEventDetails =
    !!eventDate || !!eventTime || !!eventLocation || !!registerLink;

  const result = await createPost(req.user.userId, {
    title: req.body.title,
    content: req.body.content,
    summary: req.body.summary,
    type: req.body.type,
    postAs: req.body.postAs,
    kind: req.body.kind,
    image,
    clubId: req.body.clubId ? Number(req.body.clubId) : undefined,
    eventDetails: hasEventDetails
      ? {
          date: eventDate || undefined,
          time: eventTime || undefined,
          location: eventLocation || undefined,
          registerLink: registerLink || undefined,
        }
      : null,
  });

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(201).json({
    data: result.post,
    message: result.message,
  });
}

export async function listAllPostsForModeration(req: AuthRequest, res: Response) {
  const posts = await getAllPostsForModeration();

  return res.status(200).json({
    data: posts,
    page: 1,
    limit: posts.length,
    total: posts.length,
  });
}

export async function listClubReviewQueue(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const posts = await getPendingClubReviewPosts(req.user.userId);

  return res.status(200).json({
    data: posts,
    page: 1,
    limit: posts.length,
    total: posts.length,
  });
}

export async function listAdminReviewQueue(req: AuthRequest, res: Response) {
  const posts = await getPendingAdminReviewPosts();

  return res.status(200).json({
    data: posts,
    page: 1,
    limit: posts.length,
    total: posts.length,
  });
}

export async function approvePostAtClubLevel(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const result = await approvePostByClubAdmin(postId, req.user.userId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({
    data: result.post,
    message: "Post approved by club admin and sent for super admin review.",
  });
}

export async function approvePostAtAdminLevel(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const result = await approvePostBySuperAdmin(postId, req.user.userId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  await createPostOwnerNotification(
    result.post?.authorId,
    "post_approved",
    `Your post "${result.post?.title}" was approved and published.`,
    req.user.userId,
    result.post?.id,
    result.post?.title
  );

  return res.status(200).json({
    data: result.post,
    message: "Post approved and published successfully.",
  });
}

export async function rejectPostAtClubLevel(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const reason = req.body.reason;

  const result = await rejectPost(postId, req.user.userId, reason, "club");

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  await createPostOwnerNotification(
    result.post?.authorId,
    "post_rejected",
    `Your post "${result.post?.title}" was rejected by club review. Reason: ${reason}`,
    req.user.userId,
    result.post?.id,
    result.post?.title
  );

  return res.status(200).json({
    data: result.post,
    message: "Post rejected at club review stage.",
  });
}

export async function rejectPostAtAdminLevel(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const reason = req.body.reason;

  const result = await rejectPost(postId, req.user.userId, reason, "admin");

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  await createPostOwnerNotification(
    result.post?.authorId,
    "post_rejected",
    `Your post "${result.post?.title}" was rejected by super admin review. Reason: ${reason}`,
    req.user.userId,
    result.post?.id,
    result.post?.title
  );

  return res.status(200).json({
    data: result.post,
    message: "Post rejected at super admin review stage.",
  });
}

export async function likeSinglePost(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const result = await likePost(postId, req.user.userId);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  await createPostOwnerNotification(
    result.post?.authorId,
    "interaction",
    `${await getActorName(req.user.userId)} liked your post "${result.post?.title}".`,
    req.user.userId,
    result.post?.id,
    result.post?.title
  );

  return res.status(200).json({ success: true });
}

export async function unlikeSinglePost(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const result = await unlikePost(postId, req.user.userId);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  return res.status(200).json({ success: true });
}

export async function saveSinglePost(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const result = await savePost(postId, req.user.userId);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  return res.status(200).json({ success: true });
}

export async function unsaveSinglePost(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const result = await unsavePost(postId, req.user.userId);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  return res.status(200).json({ success: true });
}

export async function listCommentsForPost(req: AuthRequest, res: Response) {
  const postId = Number(req.params.id);
  const result = await getCommentsForPost(postId);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  return res.status(200).json({ data: result.comments });
}

export async function createCommentOnPost(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const result = await createCommentForPost(postId, req.user.userId, req.body?.text || "");

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  await createPostOwnerNotification(
    result.post?.authorId,
    "interaction",
    `${await getActorName(req.user.userId)} commented on your post "${result.post?.title}".`,
    req.user.userId,
    result.post?.id,
    result.post?.title
  );

  return res.status(201).json({ data: result.comment });
}

export async function deleteCommentOnPost(req: AuthRequest, res: Response) {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const postId = Number(req.params.id);
  const commentId = Number(req.params.commentId);

  const result = await deleteCommentForPost(postId, commentId, req.user.userId);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({ success: true });
}
