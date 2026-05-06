-- CreateTable
CREATE TABLE "shift_closes" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "businessDate" TIMESTAMP(3) NOT NULL,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "storeOrderCount" INTEGER NOT NULL DEFAULT 0,
    "onlineOrderCount" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL,
    "cashRevenue" DECIMAL(10,2) NOT NULL,
    "transferRevenue" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_closes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shift_closes_staffId_idx" ON "shift_closes"("staffId");

-- CreateIndex
CREATE INDEX "shift_closes_branchId_idx" ON "shift_closes"("branchId");

-- CreateIndex
CREATE INDEX "shift_closes_businessDate_idx" ON "shift_closes"("businessDate");

-- AddForeignKey
ALTER TABLE "shift_closes" ADD CONSTRAINT "shift_closes_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_closes" ADD CONSTRAINT "shift_closes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
