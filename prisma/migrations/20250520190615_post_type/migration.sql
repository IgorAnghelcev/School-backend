-- CreateEnum
CREATE TYPE "Post_Type" AS ENUM ('NEWS', 'POST');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "type" "Post_Type" NOT NULL DEFAULT 'POST';
