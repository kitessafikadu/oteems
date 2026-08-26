-- CreateEnum
CREATE TYPE "LeaveRequestAction" AS ENUM ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "LeaveRequestStatus" ADD VALUE 'CANCELLED';

-- CreateTable
CREATE TABLE "LeaveRequestHistory" (
    "id" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "action" "LeaveRequestAction" NOT NULL,
    "performedById" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveRequestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaveRequestHistory_leaveRequestId_idx" ON "LeaveRequestHistory"("leaveRequestId");

-- CreateIndex
CREATE INDEX "LeaveRequestHistory_performedById_idx" ON "LeaveRequestHistory"("performedById");

-- CreateIndex
CREATE INDEX "LeaveRequestHistory_action_idx" ON "LeaveRequestHistory"("action");

-- AddForeignKey
ALTER TABLE "LeaveRequestHistory" ADD CONSTRAINT "LeaveRequestHistory_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequestHistory" ADD CONSTRAINT "LeaveRequestHistory_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
