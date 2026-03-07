-- AlterTable
ALTER TABLE "buildings" DROP COLUMN IF EXISTS "lat",
                        DROP COLUMN IF EXISTS "lng";

-- DropIndex
DROP INDEX IF EXISTS "buildings_lat_lng_idx";
