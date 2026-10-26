import { validateOrder, uuidPattern, orderError } from '../utils/orderValidation.js';
import { submitOrder, getOrder, resolveTable } from '../services/order.js';

function sendError(res, error) {
  // Never log receipt tokens, request bodies or database details.
  if (!error.status) console.error('Order operation failed:', error.code || 'database_error');
  return res.status(error.status || 503).json({ message: error.status ? error.message : 'Order service is temporarily unavailable. Please try again.' });
}
export async function createOrder(req, res) {
  try { return res.status(201).json({ data: await submitOrder(validateOrder(req.body)) }); }
  catch (error) { return sendError(res, error); }
}
export async function readOrder(req, res) {
  res.set('Cache-Control', 'no-store');
  try {
    const token = req.get('X-Order-Token');
    if (!/^[1-9]\d*$/.test(req.params.id) || !uuidPattern.test(token || '')) throw orderError(400, 'A valid order receipt is required.');
    return res.json({ data: await getOrder(req.params.id, token.toLowerCase()) });
  } catch (error) { return sendError(res, error); }
}
export async function readTable(req, res) {
  res.set('Cache-Control', 'no-store');
  try {
    if (!uuidPattern.test(req.params.token || '')) throw orderError(400, 'Invalid table QR code.');
    return res.json({ data: await resolveTable(req.params.token) });
  } catch (error) { return sendError(res, error); }
}
