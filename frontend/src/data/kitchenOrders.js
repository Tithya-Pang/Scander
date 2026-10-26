// Shared helpers for the kitchen screens. Orders come from the /kitchen API and are
// mapped to this shape in services/kitchenService.js:
// { id, number, table, type, receivedAt, acceptedAt, completedAt,
//   items: [{ lineId, name, price, image, qty, note, status }] }

export const TAX_RATE = 0.08;
export const RUSH_THRESHOLD_MINUTES = 12;
const MINUTE = 60 * 1000;

/** received → preparing → ready → completed, derived from dish statuses. */
export function getOrderStage(order) {
  if (order.completedAt) return 'completed';
  if (!order.acceptedAt) return 'received';
  const remaining = order.items.filter(item => item.status !== 'served');
  if (remaining.some(item => item.status === 'preparing')) return 'preparing';
  return remaining.length ? 'ready' : 'completed';
}

export function countByStatus(order) {
  return order.items.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] || 0) + 1 }),
    { preparing: 0, ready: 0, served: 0 });
}

export const minutesBetween = (from, to) => Math.max(0, Math.round((to - from) / MINUTE));
export const prepMinutes = order => minutesBetween(order.receivedAt, order.completedAt);
export const dishCount = order => order.items.reduce((sum, item) => sum + item.qty, 0);

export function orderTotals(order) {
  const subtotalCents = order.items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.qty, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return { subtotal: subtotalCents / 100, tax: taxCents / 100, total: (subtotalCents + taxCents) / 100 };
}

export const formatMoney = value => `$${value.toFixed(2)}`;
export const formatClock = time => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
export const formatDate = time => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
export const itemSummary = order => order.items.map(item => `${item.name} ×${item.qty}`).join(', ');
