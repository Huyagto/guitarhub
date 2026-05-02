CREATE TYPE "BranchStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "status" "BranchStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_inventory" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "maxStock" INTEGER NOT NULL DEFAULT 20,
    "lastRestockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_inventory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "users" ADD COLUMN "branchId" INTEGER;
ALTER TABLE "orders" ADD COLUMN "branchId" INTEGER;

CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");
CREATE INDEX "branches_status_idx" ON "branches"("status");
CREATE INDEX "users_branchId_idx" ON "users"("branchId");
CREATE INDEX "orders_branchId_idx" ON "orders"("branchId");
CREATE INDEX "branch_inventory_branchId_idx" ON "branch_inventory"("branchId");
CREATE INDEX "branch_inventory_productId_idx" ON "branch_inventory"("productId");
CREATE UNIQUE INDEX "branch_inventory_branchId_productId_key" ON "branch_inventory"("branchId", "productId");

ALTER TABLE "users" ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "branch_inventory" ADD CONSTRAINT "branch_inventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_inventory" ADD CONSTRAINT "branch_inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "branches" ("name", "code", "address", "phone", "status", "updatedAt")
VALUES ('Chi nhánh chính', 'MAIN', 'Kho trung tâm GuitarHub', NULL, 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO "branch_inventory" ("branchId", "productId", "stock", "minStock", "maxStock", "lastRestockedAt", "updatedAt")
SELECT 1, "id", "stock", "minStock", "maxStock", "lastRestockedAt", CURRENT_TIMESTAMP
FROM "products";

UPDATE "users" SET "branchId" = 1 WHERE "role" = 'STAFF';
UPDATE "orders" SET "branchId" = 1 WHERE "shippingInfo"->>'type' = 'pos';
