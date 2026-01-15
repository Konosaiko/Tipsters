/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Tipster` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Tipster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tipster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tipster" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tipster_userId_key" ON "Tipster"("userId");

-- AddForeignKey
ALTER TABLE "Tipster" ADD CONSTRAINT "Tipster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
