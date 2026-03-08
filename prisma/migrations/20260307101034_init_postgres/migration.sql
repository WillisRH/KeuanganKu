-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "item" TEXT NOT NULL,
    "quantity" INTEGER,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'lainnya',
    "rawInput" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'whatsapp',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);
