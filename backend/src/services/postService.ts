import { prisma } from "../lib/prisma";
import {
  CreatePostPayload,
  Post,
  PostKind,
  PostStatus,
  PostType,
} from "../models/postModel";
import { getRawUserById } from "./authService";
import {
  getClubById,
  getManagedClubIdsForAdmin,
  isClubAdminForClub,
} from "./clubService";

function getRelativeTime(timestamp: Date | string) {
  const createdAt = new Date(timestamp).getTime();
  const diffMs = Date.now() - createdAt;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatRelativeTime(timestamp: Date | string) {
  return getRelativeTime(timestamp);
}

function getDisplayRole(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "club_admin") return "Club Admin";
  return "Student";
}

function validatePostType(type?: PostType) {
  return !!type && ["news", "clubs", "students"].includes(type);
}

function validatePostKind(kind?: PostKind) {
  if (!kind) return true;
  return ["post", "announcement", "event"].includes(kind);
}

async function getClubAuthorData(clubId: number) {
  const club = await getClubById(clubId);

  if (!club) {
    return null;
  }

  return {
    clubId: club.id,
    clubName: club.name,
    clubAvatar: club.avatar,
  };
}

async function buildPostView(rawPost: any, userId?: string): Promise<Post> {
  const likeCount = await prisma.postLike.count({
    where: { postId: rawPost.id },
  });

  const commentCount = await prisma.postComment.count({
    where: { postId: rawPost.id },
  });

  const liked = userId
    ? !!(await prisma.postLike.findFirst({
        where: {
          postId: rawPost.id,
          userId,
        },
      }))
    : false;

  const saved = userId
    ? !!(await prisma.postSave.findFirst({
        where: {
          postId: rawPost.id,
          userId,
        },
      }))
    : false;

  return {
    id: rawPost.id,
    title: rawPost.title,
    content: rawPost.content,
    summary: rawPost.summary || undefined,
    type: rawPost.type,
    kind: rawPost.kind,
    authorType: rawPost.authorType,
    authorId: rawPost.authorId,
    authorName: rawPost.authorName,
    authorRole: rawPost.authorRole,
    author: rawPost.author,
    userAvatar: rawPost.userAvatar || undefined,
    avatar: rawPost.avatar || undefined,
    time: getRelativeTime(rawPost.createdAt),
    likes: likeCount,
    comments: commentCount,
    saved,
    liked,
    image: rawPost.image || "",
    clubId: rawPost.clubId ?? undefined,
    clubName: rawPost.clubName || undefined,
    clubAvatar: rawPost.clubAvatar || undefined,
    eventDetails:
      rawPost.eventDate || rawPost.eventTime || rawPost.eventLocation || rawPost.registerLink
        ? {
            date: rawPost.eventDate || undefined,
            time: rawPost.eventTime || undefined,
            location: rawPost.eventLocation || undefined,
            registerLink: rawPost.registerLink || undefined,
          }
        : null,
    status: rawPost.status as PostStatus,
    submittedAt: rawPost.submittedAt,
    clubReviewedBy: rawPost.clubReviewedBy || undefined,
    clubReviewedAt: rawPost.clubReviewedAt || undefined,
    adminReviewedBy: rawPost.adminReviewedBy || undefined,
    adminReviewedAt: rawPost.adminReviewedAt || undefined,
    rejectionReason: rawPost.rejectionReason || undefined,
  };
}

export async function getPosts(filter?: PostType, userId?: string): Promise<Post[]> {
  const where: any = {
    status: "approved",
  };

  if (filter) {
    where.type = filter;
  }

  const rows = await prisma.post.findMany({
    where,
    orderBy: {
      id: "desc",
    },
  });

  return Promise.all(rows.map((post) => buildPostView(post, userId)));
}

export async function getSavedPosts(userId: string): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    where: {
      status: "approved",
      saves: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return Promise.all(rows.map((post) => buildPostView(post, userId)));
}

export async function getPostById(postId: number, userId?: string): Promise<Post | null> {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      status: "approved",
    },
  });

  if (!post) return null;

  return buildPostView(post, userId);
}

export async function getRawPostById(postId: number): Promise<any | null> {
  return prisma.post.findUnique({
    where: { id: postId },
  });
}

export async function getAllPostsForModeration(): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return Promise.all(rows.map((post) => buildPostView(post)));
}

export async function getPendingClubReviewPosts(reviewerId?: string): Promise<Post[]> {
  const allPending = await prisma.post.findMany({
    where: {
      status: "pending_club_review",
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!reviewerId) {
    return Promise.all(allPending.map((post) => buildPostView(post)));
  }

  const managedClubIds = new Set(await getManagedClubIdsForAdmin(reviewerId));

  const filtered = allPending.filter((post) => {
    if (!post.clubId) return false;
    return managedClubIds.has(post.clubId);
  });

  return Promise.all(filtered.map((post) => buildPostView(post)));
}

export async function getPendingAdminReviewPosts(): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    where: {
      status: "pending_admin_review",
    },
    orderBy: {
      id: "desc",
    },
  });

  return Promise.all(rows.map((post) => buildPostView(post)));
}

export async function getApprovedPostsByClubId(
  clubId: number,
  userId?: string
): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    where: {
      clubId,
      status: "approved",
    },
    orderBy: {
      id: "desc",
    },
  });

  return Promise.all(rows.map((post) => buildPostView(post, userId)));
}

export async function getApprovedClubContentByKind(
  clubId: number,
  kind: PostKind,
  userId?: string
): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    where: {
      clubId,
      kind,
      status: "approved",
    },
    orderBy: {
      id: "desc",
    },
  });

  return Promise.all(rows.map((post) => buildPostView(post, userId)));
}

export async function createPost(userId: string, payload: CreatePostPayload) {
  if (!payload.title?.trim()) {
    return { error: "Title is required." };
  }

  if (!payload.content?.trim()) {
    return { error: "Content is required." };
  }

  if (!validatePostType(payload.type)) {
    return { error: "Valid post type is required." };
  }

  if (!validatePostKind(payload.kind)) {
    return { error: "Valid post kind is required." };
  }

  const author = await getRawUserById(userId);
  if (!author) {
    return { error: "User not found." };
  }

  const isPostingAsClub = payload.postAs === "club" || !!payload.clubId;

  if (isPostingAsClub) {
    if (!payload.clubId) {
      return { error: "Club posts must include a clubId." };
    }

    if (author.role !== "club_admin" && author.role !== "super_admin") {
      return { error: "Only club admins or super admins can post as a club." };
    }

    if (
      author.role !== "super_admin" &&
      !(await isClubAdminForClub(userId, payload.clubId))
    ) {
      return { error: "You are not assigned as an admin for this club." };
    }
  }

  const initialStatus: PostStatus =
    author.role === "super_admin" ? "approved" : "pending_admin_review";

  const clubAuthorData =
    isPostingAsClub && payload.clubId
      ? await getClubAuthorData(payload.clubId)
      : null;

  if (isPostingAsClub && !clubAuthorData) {
    return { error: "Club not found." };
  }

  const created = await prisma.post.create({
    data: {
      title: payload.title.trim(),
      content: payload.content.trim(),
      summary: payload.summary?.trim() || null,
      type: payload.type,
      kind: payload.kind || "post",
      authorType: isPostingAsClub ? "club" : "user",
      authorId: author.id,
      authorName: author.name,
      authorRole: getDisplayRole(author.role),
      author: isPostingAsClub ? clubAuthorData?.clubName || "Club" : author.name,
      userAvatar: author.avatarUrl || null,
      avatar: isPostingAsClub
        ? clubAuthorData?.clubAvatar || null
        : author.avatarUrl || null,
      image: payload.image || null,
      clubId: isPostingAsClub ? clubAuthorData?.clubId : null,
      clubName: isPostingAsClub ? clubAuthorData?.clubName || null : null,
      clubAvatar: isPostingAsClub ? clubAuthorData?.clubAvatar || null : null,
      eventDate: payload.eventDetails?.date || null,
      eventTime: payload.eventDetails?.time || null,
      eventLocation: payload.eventDetails?.location || null,
      registerLink: payload.eventDetails?.registerLink || null,
      status: initialStatus,
      submittedAt: new Date().toISOString(),
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      posts: {
        increment: 1,
      },
    },
  });

  return {
    post: await buildPostView(created, userId),
    message:
      initialStatus === "approved"
        ? "Post published successfully."
        : "Post submitted for admin review.",
  };
}

export async function approvePostByClubAdmin(postId: number, reviewerId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  if (post.status !== "pending_club_review") {
    return { error: "This post is not waiting for club review." };
  }

  if (!post.clubId || !(await isClubAdminForClub(reviewerId, post.clubId))) {
    return { error: "You are not assigned to review this club's posts." };
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      status: "pending_admin_review",
      clubReviewedBy: reviewerId,
      clubReviewedAt: new Date().toISOString(),
      rejectionReason: null,
    },
  });

  return { post: await buildPostView(updated) };
}

export async function approvePostBySuperAdmin(postId: number, reviewerId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  if (post.status !== "pending_admin_review") {
    return { error: "This post is not waiting for admin review." };
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      status: "approved",
      adminReviewedBy: reviewerId,
      adminReviewedAt: new Date().toISOString(),
      rejectionReason: null,
    },
  });

  return { post: await buildPostView(updated) };
}

export async function rejectPost(
  postId: number,
  reviewerId: string,
  reason: string,
  stage: "club" | "admin"
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  if (!reason?.trim()) {
    return { error: "Rejection reason is required." };
  }

  if (stage === "club") {
    if (post.status !== "pending_club_review") {
      return { error: "This post is not waiting for club review." };
    }

    if (!post.clubId || !(await isClubAdminForClub(reviewerId, post.clubId))) {
      return { error: "You are not assigned to review this club's posts." };
    }
  }

  if (stage === "admin" && post.status !== "pending_admin_review") {
    return { error: "This post is not waiting for admin review." };
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      status: "rejected",
      rejectionReason: reason.trim(),
      clubReviewedBy: stage === "club" ? reviewerId : post.clubReviewedBy,
      clubReviewedAt: stage === "club" ? new Date().toISOString() : post.clubReviewedAt,
      adminReviewedBy: stage === "admin" ? reviewerId : post.adminReviewedBy,
      adminReviewedAt: stage === "admin" ? new Date().toISOString() : post.adminReviewedAt,
    },
  });

  return { post: await buildPostView(updated) };
}

export async function likePost(postId: number, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return { error: "Post not found." };

  await prisma.postLike.upsert({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
    update: {},
    create: {
      postId,
      userId,
    },
  });

  return { post: await buildPostView(post) };
}

export async function unlikePost(postId: number, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return { error: "Post not found." };

  await prisma.postLike.deleteMany({
    where: {
      postId,
      userId,
    },
  });

  return { post: await buildPostView(post) };
}

export async function savePost(postId: number, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return { error: "Post not found." };

  await prisma.postSave.upsert({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
    update: {},
    create: {
      postId,
      userId,
    },
  });

  return { post: await buildPostView(post) };
}

export async function unsavePost(postId: number, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return { error: "Post not found." };

  await prisma.postSave.deleteMany({
    where: {
      postId,
      userId,
    },
  });

  return { post: await buildPostView(post) };
}

export async function getCommentsForPost(postId: number) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return { error: "Post not found." };

  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    comments: comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar || undefined,
      text: comment.text,
      time: formatRelativeTime(comment.createdAt),
      timestampMs: new Date(comment.createdAt).getTime(),
    })),
  };
}

export async function createCommentForPost(postId: number, userId: string, text: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return { error: "Post not found." };

  if (!text?.trim()) {
    return { error: "Comment text is required." };
  }

  const author = await getRawUserById(userId);
  if (!author) {
    return { error: "User not found." };
  }

  const comment = await prisma.postComment.create({
    data: {
      postId,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatarUrl || null,
      text: text.trim(),
    },
  });

  return {
    comment: {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar || undefined,
      text: comment.text,
      time: "Just now",
      timestampMs: new Date(comment.createdAt).getTime(),
    },
    post: await buildPostView(post),
  };
}

export async function deleteCommentForPost(postId: number, commentId: number, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return { error: "Post not found." };

  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.postId !== postId) {
    return { error: "Comment not found." };
  }

  if (comment.authorId !== userId) {
    return { error: "You can only delete your own comment." };
  }

  await prisma.postComment.delete({
    where: { id: commentId },
  });

  return {};
}
