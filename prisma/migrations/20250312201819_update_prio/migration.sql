/*
  Warnings:

  - Made the column `priority` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "priority" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "priority" SET NOT NULL;
