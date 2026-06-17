import prisma from '../config/database';

export async function generateMonthlyReport(year: number, month: number) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const existing = await prisma.resilienceReport.findUnique({
    where: { month: monthStr },
  });
  if (existing) return existing;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const riskEvents = await prisma.riskEvent.findMany({
    where: {
      detectedAt: { gte: startDate, lt: endDate },
    },
    include: {
      orders: true,
      alerts: true,
    },
  });

  const totalRiskEvents = riskEvents.length;

  const responseTimes: number[] = [];
  for (const event of riskEvents) {
    if (event.resolvedAt) {
      const hours = (event.resolvedAt.getTime() - event.detectedAt.getTime()) / (1000 * 60 * 60);
      responseTimes.push(hours);
    }
  }
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
    : 0;

  const alternativesWithApproval = await prisma.alternativeMatch.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
    },
    include: { approval: true },
  });

  const totalAlternatives = alternativesWithApproval.length;
  const adoptedAlternatives = alternativesWithApproval.filter(
    (a: any) => a.approval?.status === 'APPROVED'
  ).length;
  const alternativeAdoptionRate = totalAlternatives > 0
    ? adoptedAlternatives / totalAlternatives
    : 0;

  const settlements = await prisma.settlement.findMany({
    where: {
      generatedAt: { gte: startDate, lt: endDate },
    },
  });

  const costRanges: Record<string, number> = {
    '0-1000': 0,
    '1000-5000': 0,
    '5000-10000': 0,
    '10000-50000': 0,
    '50000+': 0,
  };

  for (const s of settlements) {
    const ac = s.additionalCost;
    if (ac <= 1000) costRanges['0-1000']++;
    else if (ac <= 5000) costRanges['1000-5000']++;
    else if (ac <= 10000) costRanges['5000-10000']++;
    else if (ac <= 50000) costRanges['10000-50000']++;
    else costRanges['50000+']++;
  }

  const report = await prisma.resilienceReport.create({
    data: {
      month: monthStr,
      totalRiskEvents,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      alternativeAdoptionRate: Math.round(alternativeAdoptionRate * 1000) / 1000,
      costOverspendDistribution: JSON.stringify(costRanges),
    },
  });

  return report;
}

export async function getReports(filters: { limit?: number; offset?: number }) {
  const [items, total] = await Promise.all([
    prisma.resilienceReport.findMany({
      orderBy: { month: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.resilienceReport.count(),
  ]);

  return {
    items: items.map((r: any) => ({
      ...r,
      costOverspendDistribution: JSON.parse(r.costOverspendDistribution),
    })),
    total,
  };
}

export async function getReportByMonth(month: string) {
  const report = await prisma.resilienceReport.findUnique({ where: { month } });
  if (!report) return null;
  return {
    ...report,
    costOverspendDistribution: JSON.parse(report.costOverspendDistribution),
  };
}
