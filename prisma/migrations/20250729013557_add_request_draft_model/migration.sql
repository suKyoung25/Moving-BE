-- CreateTable
CREATE TABLE "RequestDraft" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "moveType" "MoveType",
    "moveDate" TIMESTAMP(3),
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestDraft_clientId_key" ON "RequestDraft"("clientId");

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
