import prisma from '../config/database';
import { broadcastNotification } from './notification.service';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function updateSupplierCreditScore(supplierId: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      riskEvents: {
        include: { riskEvent: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!supplier) throw new Error('Supplier not found');

  let score = supplier.creditScore;

  const recentEvents = supplier.riskEvents.filter(
    (re: any) => Date.now() - re.createdAt.getTime() < THIRTY_DAYS_MS
  );

  for (const event of recentEvents) {
    const impactDeduction: Record<string, number> = {
      CRITICAL: 15,
      HIGH: 10,
      MEDIUM: 5,
      LOW: 2,
    };
    const deduction = impactDeduction[event.riskEvent.impactLevel] || 2;
    score = Math.max(0, score - deduction);
  }

  const updated = await prisma.supplier.update({
    where: { id: supplierId },
    data: { creditScore: score },
  });

  await prisma.supplierAuditTrail.create({
    data: {
      supplierId,
      action: 'CREDIT_SCORE_UPDATE',
      details: `信用评分更新: ${supplier.creditScore} -> ${score}, 近30天风险事件: ${recentEvents.length}次`,
      performedBy: 'SYSTEM',
    },
  });

  return updated;
}

export async function checkHighRiskSuppliers() {
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const suppliersWithRepeats = await prisma.supplierRiskEvent.groupBy({
    by: ['supplierId'],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
    having: { id: { _count: { gte: 2 } } },
  });

  const results = [];

  for (const item of suppliersWithRepeats) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: item.supplierId },
    });

    if (!supplier || supplier.riskLevel === 'HIGH_RISK') continue;

    const updated = await prisma.supplier.update({
      where: { id: item.supplierId },
      data: { riskLevel: 'HIGH_RISK' },
    });

    await prisma.supplierAuditTrail.create({
      data: {
        supplierId: item.supplierId,
        action: 'HIGH_RISK_MARKED',
        details: `30天内触发${item._count.id}次风险事件, 已标记为高风险, 建议进行合同审查`,
        performedBy: 'SYSTEM',
      },
    });

    broadcastNotification({
      type: 'SUPPLIER_HIGH_RISK',
      title: `供应商标记为高风险: ${supplier.name}`,
      message: `该供应商30天内触发${item._count.id}次风险事件, 建议立即进行合同审查`,
      targetRoles: ['procurement', 'management'],
      payload: { supplierId: item.supplierId, riskEventCount: item._count.id },
    });

    results.push(updated);
  }

  return results;
}

export async function getSuppliers(filters: {
  riskLevel?: string;
  category?: string;
  region?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = { active: true };
  if (filters.riskLevel) where.riskLevel = filters.riskLevel;
  if (filters.category) where.category = filters.category;
  if (filters.region) where.region = filters.region;

  const [items, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: { creditScore: 'asc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        _count: { select: { riskEvents: true, orders: true } },
      },
    }),
    prisma.supplier.count({ where }),
  ]);

  return { items, total };
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      riskEvents: {
        include: { riskEvent: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      auditTrails: { orderBy: { createdAt: 'desc' }, take: 20 },
      orders: { orderBy: { createdAt: 'desc' }, take: 20 },
      _count: { select: { riskEvents: true, orders: true } },
    },
  });
}

export function startHighRiskChecker() {
  const interval = setInterval(async () => {
    try {
      const results = await checkHighRiskSuppliers();
      if (results.length > 0) {
        console.log(`[SupplierService] High-risk check: marked ${results.length} supplier(s)`);
      }
    } catch (error) {
      console.error('[SupplierService] High-risk check error:', error);
    }
  }, 5 * 60 * 1000);

  return interval;
}
