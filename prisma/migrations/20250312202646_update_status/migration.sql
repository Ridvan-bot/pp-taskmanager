/*
  Warnings:

  - Added the required column `status` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "status" SET NOT NULL;
