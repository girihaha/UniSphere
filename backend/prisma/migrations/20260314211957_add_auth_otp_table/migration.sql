CREATE TABLE IF NOT EXISTS "public"."PasswordResetOtp" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "otpHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PasswordResetOtp_email_idx"
ON "public"."PasswordResetOtp"("email");

CREATE INDEX IF NOT EXISTS "PasswordResetOtp_expiresAt_idx"
ON "public"."PasswordResetOtp"("expiresAt");

CREATE TABLE IF NOT EXISTS "public"."PendingSignup" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "regNumber" TEXT,
  "branch" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'student',
  "otpHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PendingSignup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PendingSignup_email_key"
ON "public"."PendingSignup"("email");

CREATE INDEX IF NOT EXISTS "PendingSignup_expiresAt_idx"
ON "public"."PendingSignup"("expiresAt");
