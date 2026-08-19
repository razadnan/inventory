/*
  Warnings:

  - Made the column `productCode` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "productCode" SET NOT NULL;
