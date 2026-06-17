import { Router, Request, Response } from 'express';
import {
  collectRiskEvent,
  resolveRiskEvent,
  getRiskEvents,
  getRiskEventById,
} from '../services/risk-event.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await collectRiskEvent(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      impactLevel: req.query.impactLevel as string,
      type: req.query.type as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };
    const result = await getRiskEvents(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await getRiskEventById(req.params.id as string);
    if (!result) {
      res.status(404).json({ success: false, error: 'Risk event not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const result = await resolveRiskEvent(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
