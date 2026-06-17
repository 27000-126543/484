import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { getConnectedClientsCount } from '../services/notification.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.targetRoles) where.targetRoles = { contains: req.query.targetRoles as string };
    if (req.query.read !== undefined) where.read = req.query.read === 'true';

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.offset as string) || 0,
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({ success: true, data: { items, total } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { read: true },
    });
    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/ws-status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      connectedClients: getConnectedClientsCount(),
      endpoint: '/ws/notifications',
    },
  });
});

export default router;
