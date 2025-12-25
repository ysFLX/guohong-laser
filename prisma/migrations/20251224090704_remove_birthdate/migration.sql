/*
  Warnings:

  - You are about to drop the column `birthDate` on the `EmailVerification` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailVerification" DROP COLUMN "birthDate";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthDate";
