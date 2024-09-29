-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DANCER', 'ARTIST', 'DJ', 'INSTRUCTOR', 'ORGANIZER', 'MEDIACREW');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "style" TEXT[],
    "country" TEXT NOT NULL,
    "bio" TEXT,
    "sns" JSONB[],
    "profilePic" JSONB NOT NULL,
    "role" "Role"[] DEFAULT ARRAY['DANCER']::"Role"[],

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);
