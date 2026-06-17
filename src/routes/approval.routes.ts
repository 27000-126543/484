import { Router, Request, Response } from 'express';
import {
  approveProcurement,
  approveLogistics,
  getApprovals,
  checkApprovalTimeouts,
} from '../services/approval.service';

const router = Router();

router.post('/:id/procurement', async (req: Request, res: Response) => {
  try {
    const { approver, comment, approved } = req.body;
    const result = await approveProcurement(req.params.id as string, approver, comment, approved);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:id/logistics', async (req: Request, res: Response) => {
  try {
    const { approver, comment, approved } = req.body;
    const result = await approveLogistics(req.params.id as string, approver, comment, approved);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };
    const result = await getApprovals(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/check-timeouts', async (req: Request, res: Response) => {
  try {
    const count = await checkApprovalTimeouts();
    res.json({ success: true, data: { escalatedCount: count } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
