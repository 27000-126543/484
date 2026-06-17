import { Router, Request, Response } from 'express';
import {
  generateSettlement,
  generateSettlementsForRiskEvent,
  getSettlements,
} from '../services/settlement.service';

const router = Router();

router.post('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const result = await generateSettlement(req.params.orderId as string);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/risk-event/:riskEventId', async (req: Request, res: Response) => {
  try {
    const result = await generateSettlementsForRiskEvent(req.params.riskEventId as string);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      orderId: req.query.orderId as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };
    const result = await getSettlements(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
