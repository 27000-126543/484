import prisma from '../config/database';
import { broadcastNotification } from './notification.service';

const APPROVAL_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export async function approveProcurement(
  approvalId: string,
  approver: string,
  comment: string,
  approved: boolean
) {
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: { alternativeMatch: { include: { order: true } } },
  });

  if (!approval) throw new Error('Approval not found');
  if (approval.status !== 'PENDING_PROCUREMENT') {
    throw new Error(`Invalid approval status: ${approval.status}`);
  }

  if (!approved) {
    const updated = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: 'REJECTED',
        procurementApprover: approver,
        procurementComment: comment,
        procurementApprovedAt: new Date(),
      },
    });

    broadcastNotification({
      type: 'APPROVAL_REJECTED',
      title: `采购审批拒绝: 订单${approval.alternativeMatch.order.orderNo}`,
      message: `审批人: ${approver}, 原因: ${comment}`,
      targetRoles: ['procurement', 'logistics'],
      payload: { approvalId, alternativeMatchId: approval.alternativeMatchId },
    });

    return updated;
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: 'PENDING_LOGISTICS',
      procurementApprover: approver,
      procurementComment: comment,
      procurementApprovedAt: new Date(),
      deadline: new Date(Date.now() + APPROVAL_TIMEOUT_MS),
    },
  });

  broadcastNotification({
    type: 'APPROVAL_PROCUREMENT_PASSED',
    title: `采购审批通过，待物流主管审批: 订单${approval.alternativeMatch.order.orderNo}`,
    message: `采购审批人: ${approver}, 请物流主管尽快审批`,
    targetRoles: ['logistics'],
    payload: { approvalId, alternativeMatchId: approval.alternativeMatchId },
  });

  return updated;
}

export async function approveLogistics(
  approvalId: string,
  approver: string,
  comment: string,
  approved: boolean
) {
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: { alternativeMatch: { include: { order: true, backupSupplier: true } } },
  });

  if (!approval) throw new Error('Approval not found');
  if (approval.status !== 'PENDING_LOGISTICS') {
    throw new Error(`Invalid approval status: ${approval.status}`);
  }

  if (!approved) {
    const updated = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: 'REJECTED',
        logisticsApprover: approver,
        logisticsComment: comment,
        logisticsApprovedAt: new Date(),
      },
    });

    broadcastNotification({
      type: 'APPROVAL_REJECTED',
      title: `物流审批拒绝: 订单${approval.alternativeMatch.order.orderNo}`,
      message: `审批人: ${approver}, 原因: ${comment}`,
      targetRoles: ['procurement', 'logistics'],
      payload: { approvalId, alternativeMatchId: approval.alternativeMatchId },
    });

    return updated;
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: 'APPROVED',
      logisticsApprover: approver,
      logisticsComment: comment,
      logisticsApprovedAt: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: approval.alternativeMatch.orderId },
    data: {
      status: 'RE_ROUTED',
      supplierId: approval.alternativeMatch.backupSupplierId,
      route: approval.alternativeMatch.alternativeRoute || approval.alternativeMatch.order.route,
    },
  });

  broadcastNotification({
    type: 'APPROVAL_COMPLETED',
    title: `审批完成，调度指令已执行: 订单${approval.alternativeMatch.order.orderNo}`,
    message: `已切换至备用供应商: ${approval.alternativeMatch.backupSupplier.name}, 替代路线: ${approval.alternativeMatch.alternativeRoute}`,
    targetRoles: ['procurement', 'logistics', 'management'],
    payload: { approvalId, alternativeMatchId: approval.alternativeMatchId },
  });

  return updated;
}

export async function checkApprovalTimeouts() {
  const now = new Date();
  const timedOutApprovals = await prisma.approval.findMany({
    where: {
      status: { in: ['PENDING_PROCUREMENT', 'PENDING_LOGISTICS'] },
      deadline: { lt: now },
      reminderSentAt: null,
    },
    include: {
      alternativeMatch: { include: { order: true } },
    },
  });

  for (const approval of timedOutApprovals) {
    await prisma.approval.update({
      where: { id: approval.id },
      data: {
        status: 'TIMEOUT_ESCALATED',
        escalatedTo: 'senior_management',
        escalationReason: `审批超时(2小时), 当前状态: ${approval.status}`,
        reminderSentAt: new Date(),
      },
    });

    broadcastNotification({
      type: 'APPROVAL_TIMEOUT',
      title: `审批超时催办: 订单${approval.alternativeMatch.order.orderNo}`,
      message: `审批已超时2小时, 已转交上级处理. 当前状态: ${approval.status}`,
      targetRoles: ['procurement', 'logistics', 'management'],
      payload: { approvalId: approval.id, alternativeMatchId: approval.alternativeMatchId },
    });
  }

  return timedOutApprovals.length;
}

export async function getApprovals(filters: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    prisma.approval.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        alternativeMatch: {
          include: {
            order: { include: { supplier: true } },
            backupSupplier: true,
          },
        },
      },
    }),
    prisma.approval.count({ where }),
  ]);

  return { items, total };
}

export function startTimeoutChecker() {
  const interval = setInterval(async () => {
    try {
      const count = await checkApprovalTimeouts();
      if (count > 0) {
        console.log(`[ApprovalService] Checked timeouts, escalated ${count} approval(s)`);
      }
    } catch (error) {
      console.error('[ApprovalService] Timeout check error:', error);
    }
  }, 60 * 1000);

  return interval;
}
