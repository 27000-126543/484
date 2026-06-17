import prisma from '../config/database';
import { broadcastNotification } from './notification.service';

const REGION_IMPACT_MULTIPLIER: Record<string, number> = {
  GEOPOLITICAL: 0.9,
  NATURAL_DISASTER: 1.0,
  PORT_CONGESTION: 0.7,
  SUPPLIER_DEFAULT: 0.8,
  TRANSPORT_DISRUPTION: 0.75,
  REGULATORY_CHANGE: 0.5,
  OTHER: 0.3,
};

function assessImpactLevel(
  eventType: string,
  affectedRegions: string,
  supplierCount: number
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const baseScore = REGION_IMPACT_MULTIPLIER[eventType] || 0.3;
  const regionCount = affectedRegions.split(',').length;
  const score = baseScore * (1 + regionCount * 0.15) * (1 + Math.min(supplierCount, 50) * 0.02);

  if (score >= 0.9) return 'CRITICAL';
  if (score >= 0.7) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
}

export async function collectRiskEvent(data: {
  type: string;
  title: string;
  description: string;
  affectedRegions: string;
  source: string;
  occurredAt: string;
}) {
  const affectedSuppliers = await prisma.supplier.findMany({
    where: {
      active: true,
      region: { in: data.affectedRegions.split(',').map((r) => r.trim()) },
    },
  });

  const impactLevel = assessImpactLevel(
    data.type,
    data.affectedRegions,
    affectedSuppliers.length
  );

  const riskEvent = await prisma.riskEvent.create({
    data: {
      type: data.type as any,
      title: data.title,
      description: data.description,
      affectedRegions: data.affectedRegions,
      impactLevel: impactLevel as any,
      source: data.source,
      occurredAt: new Date(data.occurredAt),
    },
  });

  for (const supplier of affectedSuppliers) {
    await prisma.supplierRiskEvent.create({
      data: {
        supplierId: supplier.id,
        riskEventId: riskEvent.id,
      },
    });
  }

  const alert = await createAlert(riskEvent.id, impactLevel, data.title, data.description);

  const affectedOrders = await prisma.order.findMany({
    where: {
      supplierId: { in: affectedSuppliers.map((s: any) => s.id) },
      status: 'NORMAL',
    },
  });

  for (const order of affectedOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'AFFECTED', riskEventId: riskEvent.id },
    });
  }

  const targetRoles = impactLevel === 'CRITICAL' || impactLevel === 'HIGH'
    ? ['procurement', 'logistics', 'management']
    : ['procurement', 'logistics'];

  broadcastNotification({
    type: 'RISK_ALERT',
    title: `供应链风险预警: ${data.title}`,
    message: `风险等级: ${impactLevel}, 影响区域: ${data.affectedRegions}, 受影响供应商: ${affectedSuppliers.length}家, 受影响订单: ${affectedOrders.length}条`,
    targetRoles,
    payload: { riskEventId: riskEvent.id, impactLevel, alertId: alert.id },
  });

  return {
    riskEvent,
    affectedSupplierCount: affectedSuppliers.length,
    affectedOrderCount: affectedOrders.length,
    alert,
  };
}

async function createAlert(
  riskEventId: string,
  level: string,
  title: string,
  description: string
) {
  const targetRoles = level === 'CRITICAL' || level === 'HIGH'
    ? 'procurement,logistics,management'
    : 'procurement,logistics';

  return prisma.alert.create({
    data: {
      riskEventId,
      level: level as any,
      title: `供应链风险预警: ${title}`,
      message: description,
      targetRoles,
    },
  });
}

export async function resolveRiskEvent(riskEventId: string) {
  const riskEvent = await prisma.riskEvent.update({
    where: { id: riskEventId },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
  });

  await prisma.alert.updateMany({
    where: { riskEventId, status: 'ACTIVE' },
    data: { status: 'RESOLVED' },
  });

  broadcastNotification({
    type: 'RISK_RESOLVED',
    title: `风险已消解: ${riskEvent.title}`,
    message: `风险事件已标记为消解`,
    targetRoles: ['procurement', 'logistics', 'management'],
    payload: { riskEventId },
  });

  return riskEvent;
}

export async function getRiskEvents(filters: {
  status?: string;
  impactLevel?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.impactLevel) where.impactLevel = filters.impactLevel;
  if (filters.type) where.type = filters.type;

  const [items, total] = await Promise.all([
    prisma.riskEvent.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        alerts: true,
        supplierEvents: { include: { supplier: true } },
        orders: true,
      },
    }),
    prisma.riskEvent.count({ where }),
  ]);

  return { items, total };
}

export async function getRiskEventById(id: string) {
  return prisma.riskEvent.findUnique({
    where: { id },
    include: {
      alerts: true,
      supplierEvents: { include: { supplier: true } },
      orders: { include: { supplier: true, alternatives: { include: { backupSupplier: true, approval: true } } } },
    },
  });
}
