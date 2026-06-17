import prisma from '../config/database';
import { broadcastNotification } from './notification.service';

export async function generateSettlement(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      supplier: true,
      alternatives: {
        where: { selected: true },
        include: { backupSupplier: true, approval: true },
      },
    },
  });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'RE_ROUTED' && order.status !== 'COMPLETED') {
    throw new Error('Order is not in a settled state');
  }

  const originalCost = order.quantity * order.unitPrice;
  let additionalCost = 0;
  let description = '';

  const selectedAlt = order.alternatives[0];
  if (selectedAlt) {
    additionalCost = Math.max(0, selectedAlt.estimatedCost - originalCost);
    description = `原供应商: ${order.supplier.name}, 备用供应商: ${selectedAlt.backupSupplier.name}, 替代路线: ${selectedAlt.alternativeRoute}, 延迟天数: ${selectedAlt.estimatedDelay}`;
  } else {
    description = `订单${order.orderNo}风险消解结算`;
  }

  const totalCost = originalCost + additionalCost;

  const settlement = await prisma.settlement.create({
    data: {
      orderId: order.id,
      originalCost,
      additionalCost,
      totalCost,
      currency: order.currency,
      description,
    },
  });

  broadcastNotification({
    type: 'SETTLEMENT_GENERATED',
    title: `结算单已生成: 订单${order.orderNo}`,
    message: `原始成本: $${originalCost.toFixed(2)}, 额外成本: $${additionalCost.toFixed(2)}, 合计: $${totalCost.toFixed(2)}`,
    targetRoles: ['procurement', 'logistics', 'management'],
    payload: { settlementId: settlement.id, orderId },
  });

  return settlement;
}

export async function generateSettlementsForRiskEvent(riskEventId: string) {
  const orders = await prisma.order.findMany({
    where: { riskEventId, status: { in: ['RE_ROUTED', 'COMPLETED'] } },
  });

  const results = [];
  for (const order of orders) {
    const existing = await prisma.settlement.findFirst({ where: { orderId: order.id } });
    if (!existing) {
      try {
        const settlement = await generateSettlement(order.id);
        results.push({ orderId: order.id, settlementId: settlement.id });
      } catch (error: any) {
        results.push({ orderId: order.id, error: error.message });
      }
    }
  }

  return results;
}

export async function getSettlements(filters: {
  orderId?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  if (filters.orderId) where.orderId = filters.orderId;

  const [items, total] = await Promise.all([
    prisma.settlement.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.settlement.count({ where }),
  ]);

  return { items, total };
}
