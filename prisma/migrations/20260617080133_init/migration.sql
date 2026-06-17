-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "creditScore" INTEGER NOT NULL DEFAULT 100,
    "riskLevel" TEXT NOT NULL DEFAULT 'NORMAL',
    "isBackup" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SupplierRiskEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "riskEventId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierRiskEvent_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierRiskEvent_riskEventId_fkey" FOREIGN KEY ("riskEventId") REFERENCES "RiskEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplierAuditTrail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierAuditTrail_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedRegions" TEXT NOT NULL,
    "impactLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "riskEventId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "targetRoles" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Alert_riskEventId_fkey" FOREIGN KEY ("riskEventId") REFERENCES "RiskEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "originPort" TEXT NOT NULL,
    "destPort" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "riskEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_riskEventId_fkey" FOREIGN KEY ("riskEventId") REFERENCES "RiskEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlternativeMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "backupSupplierId" TEXT NOT NULL,
    "alternativeRoute" TEXT,
    "estimatedCost" REAL NOT NULL,
    "estimatedDelay" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlternativeMatch_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AlternativeMatch_backupSupplierId_fkey" FOREIGN KEY ("backupSupplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alternativeMatchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PROCUREMENT',
    "procurementApprover" TEXT,
    "procurementComment" TEXT,
    "procurementApprovedAt" DATETIME,
    "logisticsApprover" TEXT,
    "logisticsComment" TEXT,
    "logisticsApprovedAt" DATETIME,
    "escalatedTo" TEXT,
    "escalationReason" TEXT,
    "deadline" DATETIME NOT NULL,
    "reminderSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Approval_alternativeMatchId_fkey" FOREIGN KEY ("alternativeMatchId") REFERENCES "AlternativeMatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "originalCost" REAL NOT NULL,
    "additionalCost" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ResilienceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "totalRiskEvents" INTEGER NOT NULL,
    "avgResponseTime" REAL NOT NULL,
    "alternativeAdoptionRate" REAL NOT NULL,
    "costOverspendDistribution" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetRoles" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierRiskEvent_supplierId_riskEventId_key" ON "SupplierRiskEvent"("supplierId", "riskEventId");

-- CreateIndex
CREATE INDEX "RiskEvent_status_idx" ON "RiskEvent"("status");

-- CreateIndex
CREATE INDEX "RiskEvent_impactLevel_idx" ON "RiskEvent"("impactLevel");

-- CreateIndex
CREATE INDEX "RiskEvent_detectedAt_idx" ON "RiskEvent"("detectedAt");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_supplierId_idx" ON "Order"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_alternativeMatchId_key" ON "Approval"("alternativeMatchId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE INDEX "Approval_deadline_idx" ON "Approval"("deadline");

-- CreateIndex
CREATE INDEX "Settlement_orderId_idx" ON "Settlement"("orderId");

-- CreateIndex
CREATE INDEX "Settlement_generatedAt_idx" ON "Settlement"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResilienceReport_month_key" ON "ResilienceReport"("month");

-- CreateIndex
CREATE INDEX "Notification_targetRoles_idx" ON "Notification"("targetRoles");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
