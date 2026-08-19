/*
  Warnings:

  - A unique constraint covering the columns `[productCode]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "productCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "products_productCode_key" ON "products"("productCode");
