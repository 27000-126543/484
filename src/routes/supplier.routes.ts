import { Router, Request, Response } from 'express';
import {
  getSuppliers,
  getSupplierById,
  updateSupplierCreditScore,
  checkHighRiskSuppliers,
} from '../services/supplier.service';
import prisma from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      riskLevel: req.query.riskLevel as string,
      category: req.query.category as string,
      region: req.query.region as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };
    const result = await getSuppliers(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await getSupplierById(req.params.id as string);
    if (!result) {
      res.status(404).json({ success: false, error: 'Supplier not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/credit-score', async (req: Request, res: Response) => {
  try {
    const result = await updateSupplierCreditScore(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/check-high-risk', async (req: Request, res: Response) => {
  try {
    const results = await checkHighRiskSuppliers();
    res.json({ success: true, data: { markedCount: results.length, suppliers: results } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body });
    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
