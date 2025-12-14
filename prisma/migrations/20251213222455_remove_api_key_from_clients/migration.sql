/*
  Warnings:

  - You are about to drop the column `api_key` on the `clients` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "clients_api_key_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "api_key";
