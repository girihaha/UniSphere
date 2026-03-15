ALTER TABLE "NetworkNote"
ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "NetworkNote"
SET "expiresAt" = "createdAt" + INTERVAL '24 hours'
WHERE "expiresAt" IS NULL;

ALTER TABLE "NetworkNote"
ALTER COLUMN "expiresAt" SET NOT NULL;

CREATE INDEX "NetworkNote_expiresAt_idx" ON "NetworkNote"("expiresAt");
