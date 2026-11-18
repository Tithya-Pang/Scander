export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function orderError(status, message) { return Object.assign(new Error(message), { status }); }
export function validateOrder(body) {
  if (!body || !uuidPattern.test(body.tableToken || '') || !uuidPattern.test(body.requestId || '') || !uuidPattern.test(body.receiptToken || '')) {
    throw orderError(400, 'Scan a valid table QR code before placing your order.');
  }
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) throw orderError(400, 'Order must contain between 1 and 50 different items.');
  const ids = new Set();
  const items = body.items.map(item => {
    if (!Number.isSafeInteger(item?.itemId) || item.itemId < 1 || ids.has(item.itemId)
      || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20
      || !Number.isSafeInteger(item.priceCents) || item.priceCents < 0 || item.priceCents > 100000000) {
      throw orderError(400, 'Each item needs a unique ID, a quantity of 1–20, and a valid displayed price.');
    }
    ids.add(item.itemId);
    return { item_id: item.itemId, quantity: item.quantity, price_cents: item.priceCents };
  }).sort((a, b) => a.item_id - b.item_id);
  if (body.instructions != null && (typeof body.instructions !== 'string' || body.instructions.length > 500)) throw orderError(400, 'Kitchen instructions must be 500 characters or fewer.');
  return { tableToken: body.tableToken.toLowerCase(), requestId: body.requestId.toLowerCase(),
    receiptToken: body.receiptToken.toLowerCase(), items, instructions: (body.instructions || '').trim(),
    payment: validatePayment(body.payment) };
}

export const cardBrands = ['VISA', 'MASTERCARD'];
// Demo payments: the client sends only the method, card brand and last 4 digits — never a full card number.
export function validatePayment(payment) {
  if (payment == null) return { method: 'COUNTER' };
  if (payment.method === 'COUNTER') return { method: 'COUNTER' };
  if (payment.method === 'CARD' && cardBrands.includes(payment.brand) && typeof payment.last4 === 'string' && /^\d{4}$/.test(payment.last4)) {
    return { method: 'CARD', brand: payment.brand, last4: payment.last4 };
  }
  throw orderError(400, 'Choose to pay at the counter or enter valid card details.');
}
