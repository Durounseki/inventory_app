/*
  Warnings:

  - The `style` column on the `DanceEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DanceEvent" DROP COLUMN "style",
ADD COLUMN     "style" TEXT[];
