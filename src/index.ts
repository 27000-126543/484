import express from 'express';
import cors from 'cors';
import http from 'http';
import { initNotificationService } from './services/notification.service';
import { startTimeoutChecker } from './services/approval.service';
import { startHighRiskChecker } from './services/supplier.service';
import riskEventRoutes from './routes/risk-event.routes';
import alternativeMatchRoutes from './routes/alternative-match.routes';
import approvalRoutes from './routes/approval.routes';
import settlementRoutes from './routes/settlement.routes';
import supplierRoutes from './routes/supplier.routes';
import reportRoutes from './routes/report.routes';
import orderRoutes from './routes/order.routes';
import notificationRoutes from './routes/notification.routes';
import prisma from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/risk-events', riskEventRoutes);
app.use('/api/alternatives', alternativeMatchRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'supply-chain-risk-monitor',
    timestamp: new Date().toISOString(),
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const server = http.createServer(app);

initNotificationService(server);

startTimeoutChecker();
startHighRiskChecker();

async function start() {
  try {
    await prisma.$connect();
    console.log('[Database] Connected successfully');

    server.listen(PORT, () => {
      console.log(`[Server] Supply Chain Risk Monitor API running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[Server] WebSocket notifications: ws://localhost:${PORT}/ws/notifications`);
      console.log('[Scheduler] Approval timeout checker: every 1 minute');
      console.log('[Scheduler] High-risk supplier checker: every 5 minutes');
    });
  } catch (error) {
    console.error('[Fatal] Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Server] SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
