-- Update existing operator rows to new role name
UPDATE "users" SET "role" = 'operador_cftv' WHERE "role" = 'operator';
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'operador_cftv';
