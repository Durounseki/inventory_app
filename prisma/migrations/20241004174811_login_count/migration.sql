/*
  Warnings:

  - Made the column `loginCount` on table `Users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passwordUpdatedAt` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "loginCount" SET NOT NULL,
ALTER COLUMN "loginCount" SET DEFAULT 0,
ALTER COLUMN "passwordUpdatedAt" SET NOT NULL,
ALTER COLUMN "passwordUpdatedAt" SET DEFAULT CURRENT_TIMESTAMP;
