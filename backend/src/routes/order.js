import { Router } from 'express';
import { createOrder, readOrder, readTable } from '../controllers/order.js';

const router = Router();
// Bound anonymous submissions per client; database request IDs also prevent duplicate retries.
const attempts = new Map();
router.post('/', (req, res, next) => {
  const now = Date.now();
  for (const [ip, entry] of attempts) if (now - entry.start > 60000) attempts.delete(ip);
  const entry = attempts.get(req.ip) || { start: now, count: 0 };
  if (entry.count >= 10) return res.status(429).json({ message: 'Please wait a minute before placing more orders.' });
  if (attempts.size > 10000 && !attempts.has(req.ip)) return res.status(429).json({ message: 'Order service is busy. Please try again shortly.' });
  entry.count++; attempts.set(req.ip, entry); next();
}, createOrder);
router.get('/table/:token', readTable);
router.get('/:id', readOrder);
export default router;
