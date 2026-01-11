-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashierId" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "deliveryAddress" TEXT,
    "deliveryFee" REAL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
    "note" TEXT
);
INSERT INTO "new_Order" ("cashierId", "date", "deliveryAddress", "deliveryFee", "id", "number", "status", "total", "type") SELECT "cashierId", "date", "deliveryAddress", "deliveryFee", "id", "number", "status", "total", "type" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "stock" REAL NOT NULL DEFAULT 0,
    "buyPrice" REAL NOT NULL,
    "sellPrice" REAL NOT NULL,
    "image" TEXT,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("barcode", "buyPrice", "categoryId", "createdAt", "id", "image", "name", "sellPrice", "stock", "unit", "unitType", "updatedAt") SELECT "barcode", "buyPrice", "categoryId", "createdAt", "id", "image", "name", "sellPrice", "stock", "unit", "unitType", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
