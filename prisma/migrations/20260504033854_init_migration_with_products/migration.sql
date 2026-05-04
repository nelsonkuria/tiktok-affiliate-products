-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tiktokId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "saleRegion" TEXT NOT NULL,
    "originalPrice" JSONB NOT NULL,
    "salesPrice" JSONB NOT NULL,
    "commission" JSONB NOT NULL,
    "unitsSold" INTEGER NOT NULL,
    "hasInventory" BOOLEAN NOT NULL,
    "shop" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_tiktokId_key" ON "products"("tiktokId");
