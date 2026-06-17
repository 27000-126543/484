import { Router, Request, Response } from 'express';
import {
  generateMonthlyReport,
  getReports,
  getReportByMonth,
} from '../services/report.service';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.body;
    if (!year || !month) {
      res.status(400).json({ success: false, error: 'year and month are required' });
      return;
    }
    const result = await generateMonthlyReport(year, month);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };
    const result = await getReports(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:month', async (req: Request, res: Response) => {
  try {
    const result = await getReportByMonth(req.params.month as string);
    if (!result) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
