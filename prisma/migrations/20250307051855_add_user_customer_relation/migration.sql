-- CreateTable
CREATE TABLE "_UserCustomers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserCustomers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserCustomers_B_index" ON "_UserCustomers"("B");

-- AddForeignKey
ALTER TABLE "_UserCustomers" ADD CONSTRAINT "_UserCustomers_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserCustomers" ADD CONSTRAINT "_UserCustomers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
