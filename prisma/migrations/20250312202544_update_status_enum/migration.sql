-- Skapa enum-typen "Status"
CREATE TYPE "Status" AS ENUM ('NOT_STARTED', 'WIP', 'WAITING', 'CLOSED');

-- Först, skapa en ny kolumn med den nya typen
ALTER TABLE "Task" ADD COLUMN "new_status" "Status";

-- Kopiera data från den gamla kolumnen till den nya kolumnen, hantera null-värden
UPDATE "Task" SET "new_status" = CASE
  WHEN "status" = 'Not Started' THEN 'NOT_STARTED'::"Status"
  WHEN "status" = 'WIP' THEN 'WIP'::"Status"
  WHEN "status" = 'Waiting' THEN 'WAITING'::"Status"
  WHEN "status" = 'Closed' THEN 'CLOSED'::"Status"
  ELSE 'NOT_STARTED'::"Status" -- Default value if none match
END;

-- Ta bort den gamla kolumnen
ALTER TABLE "Task" DROP COLUMN "status";

-- Byt namn på den nya kolumnen till den gamla kolumnens namn
ALTER TABLE "Task" RENAME COLUMN "new_status" TO "status";

-- Upprepa samma steg för "Project" tabellen
ALTER TABLE "Project" ADD COLUMN "new_status" "Status";

-- Kopiera data från den gamla kolumnen till den nya kolumnen, hantera null-värden
UPDATE "Project" SET "new_status" = CASE
  WHEN "status" = 'Not Started' THEN 'NOT_STARTED'::"Status"
  WHEN "status" = 'WIP' THEN 'WIP'::"Status"
  WHEN "status" = 'Waiting' THEN 'WAITING'::"Status"
  WHEN "status" = 'Closed' THEN 'CLOSED'::"Status"
  ELSE 'NOT_STARTED'::"Status" -- Default value if none match
END;

-- Ta bort den gamla kolumnen
ALTER TABLE "Project" DROP COLUMN "status";

-- Byt namn på den nya kolumnen till den gamla kolumnens namn
ALTER TABLE "Project" RENAME COLUMN "new_status" TO "status";