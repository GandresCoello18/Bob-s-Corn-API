/*
  Warnings:

  - You are about to drop the column `client_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `client_ip` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_client_id_fkey";

-- DropIndex
DROP INDEX "idx_purchases_client_created_at";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "client_id",
ADD COLUMN     "client_ip" TEXT NOT NULL;

-- DropTable
DROP TABLE "clients";

-- CreateIndex
CREATE INDEX "idx_purchases_client_ip_created_at" ON "purchases"("client_ip", "created_at" DESC);
