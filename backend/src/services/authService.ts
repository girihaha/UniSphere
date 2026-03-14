import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { SignupPayload, UserRole, sanitizeUser } from "../models/userModel";

const UNIVERSITY_EMAIL_DOMAIN = "@srmist.edu.in";
const ALLOWED_SOCIAL_TYPES = ["instagram", "linkedin", "github", "portfolio"] as const;

type SocialLinkInput = {
  id?: string;
  type?: string;
  handle?: string;
  url?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createToken(user: any) {
  const secret = process.env.JWT_SECRET || "fallback_secret";

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: "7d" }
  );
}

function sanitizeUserWithDefaults(user: any) {
  return sanitizeUser({
    ...user,
    regNumber: "",
    degree: "B.Tech",
  } as any);
}

function normalizeSocialType(value?: string) {
  const normalized = value?.trim().toLowerCase() || "";
  return ALLOWED_SOCIAL_TYPES.includes(normalized as any) ? normalized : null;
}

function mapSocialLink(link: any) {
  return {
    id: link.type,
    type: link.type,
    handle: link.handle,
    url: link.url || "",
  };
}

export async function signupUser(data: SignupPayload) {
  if (!data.email?.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
    return { error: "Please use your university email (@srmist.edu.in)" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizeEmail(data.email) },
  });

  if (existing) {
    return { error: "User already exists." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      id: `user-${Date.now()}`,
      name: data.name,
      email: normalizeEmail(data.email),
      password: passwordHash,
      branch: data.branch,
      year: parseInt(data.year),
      role: "student",
    },
  });

  const token = createToken(user);

  return {
    user: sanitizeUserWithDefaults(user),
    token,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  if (!user) {
    return { error: "No account found with this email." };
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return { error: "Invalid password." };
  }

  const token = createToken(user);

  return {
    user: sanitizeUserWithDefaults(user),
    token,
  };
}

export async function getCurrentUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return sanitizeUserWithDefaults(user);
}

export async function updateCurrentUserById(userId: string, updates: any) {
  const allowedUpdates: Record<string, any> = {};

  if (typeof updates?.name === "string") {
    allowedUpdates.name = updates.name.trim();
  }

  if (typeof updates?.branch === "string") {
    allowedUpdates.branch = updates.branch.trim();
  }

  if (typeof updates?.bio === "string") {
    allowedUpdates.bio = updates.bio.trim();
  }

  if (typeof updates?.avatarUrl === "string") {
    allowedUpdates.avatarUrl = updates.avatarUrl.trim();
  }

  if (updates?.year !== undefined && updates?.year !== null && updates?.year !== "") {
    const parsedYear = Number(updates.year);
    if (!Number.isNaN(parsedYear)) {
      allowedUpdates.year = parsedYear;
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: allowedUpdates,
  });

  return sanitizeUserWithDefaults(user);
}

export async function getRawUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getAllUsers() {
  const users = await prisma.user.findMany();

  return users.map((u) => sanitizeUserWithDefaults(u));
}

export async function listUsersForAdmin() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return users.map((u) => sanitizeUserWithDefaults(u));
}

export async function updateUserRoleById(userId: string, role: UserRole) {
  const allowedRoles: UserRole[] = ["student", "club_admin", "super_admin"];

  if (!allowedRoles.includes(role)) {
    return { error: "Invalid role." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    return { error: "User not found." };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return {
    user: sanitizeUserWithDefaults(user),
  };
}

export async function getSocialLinksByUserId(userId: string) {
  const links = await prisma.socialLink.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });

  return links.map(mapSocialLink);
}

export async function updateSocialLinksByUserId(
  userId: string,
  links: SocialLinkInput[]
) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    return [];
  }

  const normalizedLinks = (Array.isArray(links) ? links : [])
    .map((link) => {
      const type = normalizeSocialType(link?.type || link?.id);
      const handle = typeof link?.handle === "string" ? link.handle.trim() : "";
      const url = typeof link?.url === "string" ? link.url.trim() : "";

      if (!type) return null;
      if (!handle) return null;

      return {
        type,
        handle,
        url: url || null,
      };
    })
    .filter(Boolean) as Array<{
    type: string;
    handle: string;
    url: string | null;
  }>;

  await prisma.$transaction(async (tx) => {
    await tx.socialLink.deleteMany({
      where: { userId },
    });

    if (normalizedLinks.length > 0) {
      await tx.socialLink.createMany({
        data: normalizedLinks.map((link) => ({
          userId,
          type: link.type,
          handle: link.handle,
          url: link.url,
        })),
      });
    }
  });

  return getSocialLinksByUserId(userId);
}