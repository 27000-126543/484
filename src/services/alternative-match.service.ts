import prisma from '../config/database';
import { broadcastNotification } from './notification.service';

interface MatchCandidate {
  supplierId: string;
  score: number;
  estimatedCost: number;
  estimatedDelay: number;
  alternativeRoute: string;
}

function calculateMatchScore(
  backupSupplier: any,
  order: any,
  alternativeRoute: string
): number {
  let score = 0;

  if (backupSupplier.category === order.supplier.category) score += 30;
  else if (backupSupplier.category === order.commodity) score += 20;

  score += Math.max(0, 100 - backupSupplier.creditScore * 0.1);

  if (backupSupplier.riskLevel === 'NORMAL') score += 25;
  else if (backupSupplier.riskLevel === 'ELEVATED') score += 10;

  if (alternativeRoute && alternativeRoute !== order.route) score += 15;

  return Math.min(100, score);
}

function estimateAlternativeCost(
  originalCost: number,
  backupSupplier: any,
  estimatedDelay: number
): number {
  const delayPremium = estimatedDelay * originalCost * 0.005;
  const backupPremium = originalCost * (backupSupplier.riskLevel === 'HIGH_RISK' ? 0.3 : 0.1);
  return Math.round((originalCost + delayPremium + backupPremium) * 100) / 100;
}

function generateAlternativeRoute(originPort: string, destPort: string, currentRoute: string): string {
  const routes = [
    `${originPort}-SIN-${destPort}`,
    `${originPort}-RTM-${destPort}`,
    `${originPort}-DXB-${destPort}`,
    `${originPort}-HKG-${destPort}`,
  ];
  const alt = routes.find((r) => r !== currentRoute);
  return alt || `${originPort}-ALT-${destPort}`;
}

export async function matchAlternativesForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { supplier: true },
  });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'AFFECTED') throw new Error('Order is not in affected status');

  const backupSuppliers = await prisma.supplier.findMany({
    where: {
      isBackup: true,
      active: true,
      category: order.supplier.category,
      id: { not: order.supplierId },
    },
  });

  const candidates: MatchCandidate[] = [];

  for (const backup of backupSuppliers) {
    const altRoute = generateAlternativeRoute(order.originPort, order.destPort, order.route);
    const estimatedDelay = Math.floor(Math.random() * 7) + 1;
    const score = calculateMatchScore(backup, order, altRoute);
    const estimatedCost = estimateAlternativeCost(
      order.quantity * order.unitPrice,
      backup,
      estimatedDelay
    );

    candidates.push({
      supplierId: backup.id,
      score,
      estimatedCost,
      estimatedDelay,
      alternativeRoute: altRoute,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const topCandidates = candidates.slice(0, 3);

  const matches = [];
  for (const candidate of topCandidates) {
    const match = await prisma.alternativeMatch.create({
      data: {
        orderId: order.id,
        backupSupplierId: candidate.supplierId,
        alternativeRoute: candidate.alternativeRoute,
        estimatedCost: candidate.estimatedCost,
        estimatedDelay: candidate.estimatedDelay,
        score: candidate.score,
      },
    });
    matches.push(match);
  }

  if (matches.length > 0) {
    await prisma.alternativeMatch.update({
      where: { id: matches[0].id },
      data: { selected: true },
    });

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 2);

    await prisma.approval.create({
      data: {
        alternativeMatchId: matches[0].id,
        status: 'PENDING_PROCUREMENT',
        deadline,
      },
    });

    broadcastNotification({
      type: 'ALTERNATIVE_MATCH',
      title: `替代方案已生成: 订单${order.orderNo}`,
      message: `已匹配${matches.length}个替代方案, 最优方案评分: ${topCandidates[0].score.toFixed(1)}, 预估额外成本: $${topCandidates[0].estimatedCost}`,
      targetRoles: ['procurement', 'logistics'],
      payload: { orderId: order.id, matchIds: matches.map((m) => m.id) },
    });
  }

  return matches;
}

export async function matchAlternativesForRiskEvent(riskEventId: string) {
  const affectedOrders = await prisma.order.findMany({
    where: { riskEventId, status: 'AFFECTED' },
  });

  const results = [];
  for (const order of affectedOrders) {
    try {
      const matches = await matchAlternativesForOrder(order.id);
      results.push({ orderId: order.id, matchCount: matches.length });
    } catch (error: any) {
      results.push({ orderId: order.id, error: error.message });
    }
  }

  return results;
}

export async function getAlternativeMatches(orderId: string) {
  return prisma.alternativeMatch.findMany({
    where: { orderId },
    include: {
      backupSupplier: true,
      approval: true,
    },
    orderBy: { score: 'desc' },
  });
}
