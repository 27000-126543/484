import { Router, Request, Response } from 'express';
import {
  matchAlternativesForOrder,
  matchAlternativesForRiskEvent,
  getAlternativeMatches,
} from '../services/alternative-match.service';

const router = Router();

router.post('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const result = await matchAlternativesForOrder(req.params.orderId as string);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/risk-event/:riskEventId', async (req: Request, res: Response) => {
  try {
    const result = await matchAlternativesForRiskEvent(req.params.riskEventId as string);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const result = await getAlternativeMatches(req.params.orderId as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
