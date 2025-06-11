-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_classId_fkey";

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
