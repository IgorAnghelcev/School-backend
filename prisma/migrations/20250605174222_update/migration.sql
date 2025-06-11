/*
  Warnings:

  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_postId_fkey";

-- DropTable
DROP TABLE "Photo";

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "File_postId_idx" ON "File"("postId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
