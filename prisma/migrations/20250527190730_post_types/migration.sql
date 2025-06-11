-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Post_Type" ADD VALUE 'ABOUT';
ALTER TYPE "Post_Type" ADD VALUE 'TEACHERS';
ALTER TYPE "Post_Type" ADD VALUE 'TEACHERS_DOCUMENTS';
ALTER TYPE "Post_Type" ADD VALUE 'STUDENTS';
ALTER TYPE "Post_Type" ADD VALUE 'PARENTS';
