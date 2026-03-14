/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Club` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestampMs` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorName` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorRole` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorType` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submittedAt` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SocialLink" DROP CONSTRAINT "SocialLink_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Club" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "followers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "members" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "actionState" TEXT,
ADD COLUMN     "actorRole" TEXT,
ADD COLUMN     "postId" INTEGER,
ADD COLUMN     "postTitle" TEXT,
ADD COLUMN     "timestamp" TEXT NOT NULL DEFAULT 'Just now',
ADD COLUMN     "timestampMs" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "adminReviewedAt" TEXT,
ADD COLUMN     "adminReviewedBy" TEXT,
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "authorName" TEXT NOT NULL,
ADD COLUMN     "authorRole" TEXT NOT NULL,
ADD COLUMN     "authorType" TEXT NOT NULL,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "clubAvatar" TEXT,
ADD COLUMN     "clubName" TEXT,
ADD COLUMN     "clubReviewedAt" TEXT,
ADD COLUMN     "clubReviewedBy" TEXT,
ADD COLUMN     "eventDate" TEXT,
ADD COLUMN     "eventLocation" TEXT,
ADD COLUMN     "eventTime" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "registerLink" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "submittedAt" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "userAvatar" TEXT;

-- AlterTable
ALTER TABLE "public"."SocialLink" ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "public"."ClubTag" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ClubTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClubAdmin" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ClubAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClubFollower" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ClubFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostLike" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostSave" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PostSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostComment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConnectionRequest" (
    "id" SERIAL NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NetworkConnection" (
    "id" SERIAL NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NetworkNote" (
    "id" SERIAL NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubAdmin_clubId_userId_key" ON "public"."ClubAdmin"("clubId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubFollower_clubId_userId_key" ON "public"."ClubFollower"("clubId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "public"."PostLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostSave_postId_userId_key" ON "public"."PostSave"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionRequest_fromUserId_toUserId_key" ON "public"."ConnectionRequest"("fromUserId", "toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "NetworkConnection_userAId_userBId_key" ON "public"."NetworkConnection"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_username_key" ON "public"."Club"("username");

-- AddForeignKey
ALTER TABLE "public"."SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubTag" ADD CONSTRAINT "ClubTag_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubAdmin" ADD CONSTRAINT "ClubAdmin_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubAdmin" ADD CONSTRAINT "ClubAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubFollower" ADD CONSTRAINT "ClubFollower_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubFollower" ADD CONSTRAINT "ClubFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostSave" ADD CONSTRAINT "PostSave_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostSave" ADD CONSTRAINT "PostSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostComment" ADD CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NetworkNote" ADD CONSTRAINT "NetworkNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
