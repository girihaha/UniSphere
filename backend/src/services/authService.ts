import bcrypt from "bcryptjs";
import type { PendingSignup } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { sendOtpMail } from "../lib/mailer";
import { SignupPayload, UserRole, sanitizeUser } from "../models/userModel";

const UNIVERSITY_EMAIL_DOMAIN = "@srmist.edu.in";
const ALLOWED_SOCIAL_TYPES = ["instagram", "linkedin", "github", "portfolio"] as const;
const OTP_EXPIRY_MINUTES = 10;

type SocialLinkInput = {
  id?: string;
  type?: string;
  handle?: string;
  url?: string;
};

type ForgotPasswordRequestResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

type VerifyOtpResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

type ResetPasswordResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeRegNumber(regNumber?: string) {
  return regNumber?.trim().toUpperCase() || "";
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
    regNumber: user.regNumber || "",
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

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashOtp(otp: string) {
  return bcrypt.hash(otp, 10);
}

async function compareOtp(otp: string, otpHash: string) {
  return bcrypt.compare(otp, otpHash);
}

function getOtpExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: "signup" | "forgot_password"
) {
  return sendOtpMail({
    to: email,
    otp,
    purpose,
  });
}

async function restorePendingSignup(
  email: string,
  previousPendingSignup: PendingSignup | null
) {
  if (!previousPendingSignup) {
    await prisma.pendingSignup.deleteMany({
      where: { email },
    });
    return;
  }

  await prisma.pendingSignup.update({
    where: { email },
    data: {
      name: previousPendingSignup.name,
      password: previousPendingSignup.password,
      regNumber: previousPendingSignup.regNumber,
      branch: previousPendingSignup.branch,
      year: previousPendingSignup.year,
      role: previousPendingSignup.role,
      otpHash: previousPendingSignup.otpHash,
      expiresAt: previousPendingSignup.expiresAt,
      createdAt: previousPendingSignup.createdAt,
    },
  });
}

function validatePassword(password?: string) {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  return null;
}

function validateUniversityEmail(email?: string) {
  if (!email?.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
    return `Please use your university email (${UNIVERSITY_EMAIL_DOMAIN})`;
  }

  return null;
}

export async function signupUser(data: SignupPayload) {
  if (!data.email) {
    return { error: "Email is required." };
  }

  if (!data.name?.trim()) {
    return { error: "Name is required." };
  }

  if (!data.branch?.trim()) {
    return { error: "Branch is required." };
  }

  const normalizedEmail = normalizeEmail(data.email);

  const emailError = validateUniversityEmail(normalizedEmail);
  if (emailError) {
    return { error: emailError };
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    return { error: passwordError };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { error: "User already exists." };
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const normalizedYear = Number.parseInt(String(data.year), 10);
  const existingPendingSignup = await prisma.pendingSignup.findUnique({
    where: { email: normalizedEmail },
  });

  await prisma.pendingSignup.upsert({
    where: { email: normalizedEmail },
    update: {
      name: data.name.trim(),
      password: passwordHash,
      regNumber: normalizeRegNumber((data as any).regNumber),
      branch: data.branch.trim(),
      year: Number.isNaN(normalizedYear) ? 1 : normalizedYear,
      role: "student",
      otpHash,
      expiresAt: getOtpExpiryDate(),
      createdAt: new Date(),
    },
    create: {
      name: data.name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      regNumber: normalizeRegNumber((data as any).regNumber),
      branch: data.branch.trim(),
      year: Number.isNaN(normalizedYear) ? 1 : normalizedYear,
      role: "student",
      otpHash,
      expiresAt: getOtpExpiryDate(),
    },
  });

  const mailResult = await sendOtpEmail(normalizedEmail, otp, "signup");

  if (mailResult.success === false) {
    await restorePendingSignup(normalizedEmail, existingPendingSignup);
    return { error: mailResult.error };
  }

  return {
    requiresOtp: true,
    message: "OTP sent to your university email. Verify OTP to complete signup.",
    email: normalizedEmail,
  };
}

export async function verifySignupOtp(email: string, otp: string) {
  if (!email?.trim()) {
    return { error: "Email is required." };
  }

  if (!otp?.trim()) {
    return { error: "OTP is required." };
  }

  const normalizedEmail = normalizeEmail(email);

  const pendingSignup = await prisma.pendingSignup.findUnique({
    where: { email: normalizedEmail },
  });

  if (!pendingSignup) {
    return { error: "No pending signup found for this email." };
  }

  if (pendingSignup.expiresAt.getTime() < Date.now()) {
    await prisma.pendingSignup.delete({
      where: { email: normalizedEmail },
    });

    return { error: "OTP expired. Please sign up again." };
  }

  const otpValid = await compareOtp(otp, pendingSignup.otpHash);

  if (!otpValid) {
    return { error: "Invalid OTP." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    await prisma.pendingSignup.delete({
      where: { email: normalizedEmail },
    });

    return { error: "User already exists." };
  }

  const user = await prisma.user.create({
    data: {
      id: `user-${Date.now()}`,
      name: pendingSignup.name,
      email: pendingSignup.email,
      password: pendingSignup.password,
      regNumber: pendingSignup.regNumber || "",
      branch: pendingSignup.branch,
      year: pendingSignup.year,
      role: pendingSignup.role || "student",
    },
  });

  await prisma.pendingSignup.delete({
    where: { email: normalizedEmail },
  });

  const token = createToken(user);

  return {
    user: sanitizeUserWithDefaults(user),
    token,
    message: "Signup completed successfully.",
  };
}

export async function resendSignupOtp(email: string) {
  if (!email?.trim()) {
    return { error: "Email is required." };
  }

  const normalizedEmail = normalizeEmail(email);

  const pendingSignup = await prisma.pendingSignup.findUnique({
    where: { email: normalizedEmail },
  });

  if (!pendingSignup) {
    return { error: "No pending signup found for this email." };
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const previousPendingSignup = pendingSignup;

  await prisma.pendingSignup.update({
    where: { email: normalizedEmail },
    data: {
      otpHash,
      expiresAt: getOtpExpiryDate(),
      createdAt: new Date(),
    },
  });

  const mailResult = await sendOtpEmail(normalizedEmail, otp, "signup");

  if (mailResult.success === false) {
    await restorePendingSignup(normalizedEmail, previousPendingSignup);
    return { error: mailResult.error };
  }

  return {
    success: true,
    message: "Signup OTP resent successfully.",
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

export async function requestForgotPasswordOtp(
  email: string
): Promise<ForgotPasswordRequestResult> {
  if (!email?.trim()) {
    return { error: "Email is required." };
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { error: "No account found with this email." };
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);

  const createdOtp = await prisma.passwordResetOtp.create({
    data: {
      email: normalizedEmail,
      otpHash,
      expiresAt: getOtpExpiryDate(),
    },
  });

  const mailResult = await sendOtpEmail(normalizedEmail, otp, "forgot_password");

  if (mailResult.success === false) {
    await prisma.passwordResetOtp.delete({
      where: { id: createdOtp.id },
    });
    return { error: mailResult.error };
  }

  return {
    success: true,
    message: "Password reset OTP sent to your email.",
  };
}

export async function verifyForgotPasswordOtp(
  email: string,
  otp: string
): Promise<VerifyOtpResult> {
  if (!email?.trim()) {
    return { error: "Email is required." };
  }

  if (!otp?.trim()) {
    return { error: "OTP is required." };
  }

  const normalizedEmail = normalizeEmail(email);

  const latestOtp = await prisma.passwordResetOtp.findFirst({
    where: {
      email: normalizedEmail,
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestOtp) {
    return { error: "No OTP request found. Please request a new OTP." };
  }

  if (latestOtp.expiresAt.getTime() < Date.now()) {
    return { error: "OTP expired. Please request a new OTP." };
  }

  const otpValid = await compareOtp(otp, latestOtp.otpHash);

  if (!otpValid) {
    return { error: "Invalid OTP." };
  }

  return {
    success: true,
    message: "OTP verified successfully.",
  };
}

export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  if (!email?.trim()) {
    return { error: "Email is required." };
  }

  if (!otp?.trim()) {
    return { error: "OTP is required." };
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return { error: passwordError };
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { error: "No account found with this email." };
  }

  const latestOtp = await prisma.passwordResetOtp.findFirst({
    where: {
      email: normalizedEmail,
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestOtp) {
    return { error: "No OTP request found. Please request a new OTP." };
  }

  if (latestOtp.expiresAt.getTime() < Date.now()) {
    return { error: "OTP expired. Please request a new OTP." };
  }

  const otpValid = await compareOtp(otp, latestOtp.otpHash);

  if (!otpValid) {
    return { error: "Invalid OTP." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: passwordHash,
      },
    }),
    prisma.passwordResetOtp.update({
      where: { id: latestOtp.id },
      data: {
        consumedAt: new Date(),
      },
    }),
  ]);

  return {
    success: true,
    message: "Password reset successfully.",
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
