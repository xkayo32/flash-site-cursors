import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'estudos-backend-node',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get('/simple', (_req, res) => {
  res.send('OK');
});

export default router;