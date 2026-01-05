/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add username column with temporary default
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Update existing users: Extract username from email (part before @)
UPDATE "User" SET "username" = SPLIT_PART(email, '@', 1);

-- Make username NOT NULL
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
