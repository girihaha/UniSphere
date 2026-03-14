import { prisma } from "../lib/prisma";
import {
  AssignClubAdminPayload,
  CreateClubPayload,
} from "../models/clubModel";
import { getRawUserById } from "./authService";

function normalizeUsername(username: string) {
  const trimmed = username.trim().toLowerCase();
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  return [...new Set(
    tags
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter(Boolean)
  )];
}

async function getFollowerCount(clubId: number) {
  return prisma.clubFollower.count({
    where: { clubId },
  });
}

async function syncClubFollowerCount(clubId: number) {
  const count = await getFollowerCount(clubId);

  await prisma.club.update({
    where: { id: clubId },
    data: {
      followers: count,
      members: count,
    },
  });
}

export async function getClubs(userId?: string) {
  const clubs = await prisma.club.findMany({
    include: {
      followerRecords: true,
      admins: true,
      tags: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return clubs.map((club) => ({
    ...club,
    followers: club.followerRecords.length,
    members: club.members ?? club.followerRecords.length,
    tags: club.tags.map((tag) => tag.value),
    isFollowing: userId
      ? club.followerRecords.some((f) => f.userId === userId)
      : false,
  }));
}

export async function getClubById(id: number, userId?: string) {
  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      followerRecords: true,
      admins: true,
      tags: true,
    },
  });

  if (!club) return null;

  return {
    ...club,
    followers: club.followerRecords.length,
    members: club.members ?? club.followerRecords.length,
    tags: club.tags.map((tag) => tag.value),
    isFollowing: userId
      ? club.followerRecords.some((f) => f.userId === userId)
      : false,
  };
}

export async function getManagedClubsForAdmin(userId: string) {
  return prisma.club.findMany({
    where: {
      admins: {
        some: { userId },
      },
    },
    include: {
      tags: true,
      followerRecords: true,
      admins: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getManagedClubIdsForAdmin(userId: string) {
  const clubs = await getManagedClubsForAdmin(userId);
  return clubs.map((c) => c.id);
}

export async function isClubAdminForClub(userId: string, clubId: number) {
  const admin = await prisma.clubAdmin.findFirst({
    where: {
      clubId,
      userId,
    },
  });

  return Boolean(admin);
}

export async function followClub(userId: string, clubId: number) {
  const [club, user] = await Promise.all([
    prisma.club.findUnique({
      where: { id: clubId },
    }),
    getRawUserById(userId),
  ]);

  if (!club) {
    return { error: "Club not found." };
  }

  if (!user) {
    return { error: "User not found." };
  }

  await prisma.clubFollower.upsert({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
    update: {},
    create: {
      clubId,
      userId,
    },
  });

  await syncClubFollowerCount(clubId);

  return {};
}

export async function unfollowClub(userId: string, clubId: number) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!club) {
    return { error: "Club not found." };
  }

  await prisma.clubFollower.deleteMany({
    where: {
      clubId,
      userId,
    },
  });

  await syncClubFollowerCount(clubId);

  return {};
}

export async function getFollowedClubIds(userId: string) {
  const follows = await prisma.clubFollower.findMany({
    where: { userId },
    select: {
      clubId: true,
    },
  });

  return follows.map((f) => f.clubId);
}

export async function createClub(
  createdBy: string,
  payload: CreateClubPayload
) {
  if (!payload.name?.trim()) {
    return { error: "Club name is required." };
  }

  if (!payload.username?.trim()) {
    return { error: "Club username is required." };
  }

  if (!payload.description?.trim()) {
    return { error: "Club description is required." };
  }

  if (!payload.category?.trim()) {
    return { error: "Club category is required." };
  }

  const creator = await getRawUserById(createdBy);

  if (!creator) {
    return { error: "Creator not found." };
  }

  const normalizedUsername = normalizeUsername(payload.username);

  const existing = await prisma.club.findFirst({
    where: {
      OR: [
        { name: payload.name.trim() },
        { username: normalizedUsername },
      ],
    },
  });

  if (existing) {
    return { error: "Club already exists." };
  }

  const cleanTags = normalizeTags(payload.tags);

  const club = await prisma.club.create({
    data: {
      name: payload.name.trim(),
      username: normalizedUsername,
      description: payload.description.trim(),
      category: payload.category.trim(),
      avatar:
        payload.avatar?.trim() ||
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      coverImage:
        payload.coverImage?.trim() ||
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      verified: payload.verified ?? false,
      isOfficial: payload.isOfficial ?? false,
      createdBy,
      tags: cleanTags.length
        ? {
            create: cleanTags.map((tag) => ({
              value: tag,
            })),
          }
        : undefined,
      admins: {
        create: {
          userId: createdBy,
        },
      },
    },
    include: {
      tags: true,
      admins: true,
      followerRecords: true,
    },
  });

  return {
    club: {
      ...club,
      tags: club.tags.map((tag) => tag.value),
      followers: club.followerRecords.length,
      isFollowing: false,
    },
  };
}

export async function assignClubAdmin(
  clubId: number,
  payload: AssignClubAdminPayload
) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!club) {
    return { error: "Club not found." };
  }

  if (!payload?.userId) {
    return { error: "User id is required." };
  }

  const user = await getRawUserById(payload.userId);

  if (!user) {
    return { error: "User not found." };
  }

  if (user.role !== "club_admin" && user.role !== "super_admin") {
    return { error: "User must have club_admin or super_admin role." };
  }

  const existingAdmin = await prisma.clubAdmin.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId: user.id,
      },
    },
  });

  if (existingAdmin) {
    return { error: "User is already assigned as a club admin." };
  }

  await prisma.clubAdmin.create({
    data: {
      clubId,
      userId: user.id,
    },
  });

  const updatedClub = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      tags: true,
      admins: true,
      followerRecords: true,
    },
  });

  return {
    club: updatedClub
      ? {
          ...updatedClub,
          tags: updatedClub.tags.map((tag) => tag.value),
          followers: updatedClub.followerRecords.length,
        }
      : club,
  };
}