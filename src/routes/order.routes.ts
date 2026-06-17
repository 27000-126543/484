import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.supplierId) where.supplierId = req.query.supplierId;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.offset as string) || 0,
        include: {
          supplier: true,
          riskEvent: true,
          alternatives: { include: { backupSupplier: true, approval: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, data: { items, total } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        supplier: true,
        riskEvent: true,
        alternatives: { include: { backupSupplier: true, approval: true } },
      },
    });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.create({ data: req.body });
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
