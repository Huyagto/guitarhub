ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staffCode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_staffCode_key" ON "users"("staffCode");
