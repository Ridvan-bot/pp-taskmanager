-- Skapa enum-typen "Priority"
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'BC');

-- Först, skapa en ny kolumn med den nya typen
ALTER TABLE "Task" ADD COLUMN "new_priority" "Priority";

-- Kopiera data från den gamla kolumnen till den nya kolumnen, hantera null-värden
UPDATE "Task" SET "new_priority" = CASE
  WHEN "priority" = 1 THEN 'HIGH'::"Priority"
  WHEN "priority" = 2 THEN 'MEDIUM'::"Priority"
  WHEN "priority" = 3 THEN 'LOW'::"Priority"
  WHEN "priority" = 4 THEN 'BC'::"Priority"
  ELSE 'LOW'::"Priority" -- Default value if none match
END;

-- Ta bort den gamla kolumnen
ALTER TABLE "Task" DROP COLUMN "priority";

-- Byt namn på den nya kolumnen till den gamla kolumnens namn
ALTER TABLE "Task" RENAME COLUMN "new_priority" TO "priority";

-- Upprepa samma steg för "Project" tabellen
ALTER TABLE "Project" ADD COLUMN "new_priority" "Priority";

-- Kopiera data från den gamla kolumnen till den nya kolumnen, hantera null-värden
UPDATE "Project" SET "new_priority" = CASE
  WHEN "priority" = 1 THEN 'HIGH'::"Priority"
  WHEN "priority" = 2 THEN 'MEDIUM'::"Priority"
  WHEN "priority" = 3 THEN 'LOW'::"Priority"
  WHEN "priority" = 4 THEN 'BC'::"Priority"
  ELSE 'LOW'::"Priority" -- Default value if none match
END;

-- Ta bort den gamla kolumnen
ALTER TABLE "Project" DROP COLUMN "priority";

-- Byt namn på den nya kolumnen till den gamla kolumnens namn
ALTER TABLE "Project" RENAME COLUMN "new_priority" TO "priority";