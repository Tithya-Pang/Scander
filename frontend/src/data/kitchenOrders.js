import { menuItems } from './menu';

// Frontend mock data for the kitchen screens. Shapes mirror what a future
// orders API would return, so the context can later swap seeds for fetch calls.

export const TAX_RATE = 0.08;
export const RUSH_THRESHOLD_MINUTES = 12;
const MINUTE = 60 * 1000;

function menuDish(id, notes) {
  const { name, price, image, imagePosition } = menuItems.find(item => item.id === id);
  return { name, price, image, imagePosition, notes };
}

export const dishes = {
  icedLatte: menuDish(1, ['Less sugar', 'No ice', 'Oat milk']),
  chickenSandwich: menuDish(2, ['With fries', 'No onions', 'Toasted']),
  friedRice: menuDish(3, ['No spicy, extra scallions', 'Extra spicy', 'With vegetables']),
  cappuccino: menuDish(4, ['Extra shot', 'Oat milk', 'Extra hot']),
  avocadoToast: menuDish(5, ['With poached egg', 'No chili flakes']),
  chocolateCake: menuDish(6, ['Warm', 'Extra frosting']),
  matchaLatte: { name: 'Matcha Latte', price: 4.00, notes: ['Less sugar', 'Oat milk'] },
  flatWhite: { name: 'Flat White', price: 3.75, notes: ['Less sugar', 'Extra shot'] },
  classicCoke: { name: 'Classic Coke', price: 2.50, notes: ['No ice'] },
  blueberryMuffin: { name: 'Blueberry Muffin', price: 3.25, notes: ['Warm'] },
  truffle: { name: 'Truffle Pasta', price: 9.50, notes: ['With mushrooms', 'Extra parmesan'] },
  gardenSalad: { name: 'Garden Salad', price: 6.00, notes: ['Dressing on side'] },
  grilledSalmon: { name: 'Grilled Salmon', price: 12.00, notes: ['With lemon butter sauce'] },
  mushroomSoup: { name: 'Mushroom Soup', price: 5.00, notes: ['No cream'] },
};

const dishKeys = Object.keys(dishes);

function line(orderId, index, [dishKey, qty = 1, note = '', status = 'preparing']) {
  const { notes, ...dish } = dishes[dishKey];
  return { lineId: `${orderId}-${index}`, dishKey, ...dish, qty, note, status };
}

function order({ id, table, type = 'dine-in', receivedAt, acceptedAt = null, completedAt = null, items }) {
  return { id, table, type, receivedAt, acceptedAt, completedAt, items: items.map((item, index) => line(id, index, item)) };
}

function activeSeed(now) {
  const ago = minutes => now - minutes * MINUTE;
  const received = (id, table, type, minutes, items) =>
    order({ id, table, type, receivedAt: ago(minutes), items: items.map(([key, qty, note]) => [key, qty, note, 'pending']) });
  const accepted = (id, table, type, minutes, items) =>
    order({ id, table, type, receivedAt: ago(minutes), acceptedAt: ago(minutes - 1), items });
  return [
    received(1058, 4, 'dine-in', 2, [['truffle', 1, 'With mushrooms'], ['gardenSalad', 1, 'Dressing on side'], ['icedLatte', 1, 'Less sugar']]),
    received(1057, 6, 'takeaway', 4, [['chickenSandwich', 1, 'With fries'], ['matchaLatte', 1, 'Less sugar']]),
    received(1054, 9, 'dine-in', 6, [['avocadoToast', 1, 'With poached egg']]),
    accepted(1050, 7, 'dine-in', 6, [['icedLatte', 1, 'Less sugar', 'served'], ['chickenSandwich', 1, 'With fries', 'ready'], ['friedRice', 1, 'With vegetables', 'preparing']]),
    accepted(1051, 3, 'dine-in', 8, [['matchaLatte', 1, 'Less sugar', 'preparing'], ['blueberryMuffin', 1, '', 'preparing']]),
    accepted(1056, 8, 'dine-in', 14, [['grilledSalmon', 1, 'With lemon butter sauce', 'served'], ['friedRice', 2, '', 'ready'], ['mushroomSoup', 1, '', 'preparing'], ['gardenSalad', 1, '', 'preparing']]),
    accepted(1048, 12, 'dine-in', 10, [['avocadoToast', 1, '', 'ready'], ['cappuccino', 2, 'Oat milk', 'ready'], ['chocolateCake', 1, 'Warm', 'ready']]),
    accepted(1049, 1, 'takeaway', 7, [['truffle', 1, '', 'ready'], ['gardenSalad', 1, '', 'ready']]),
    accepted(1053, 5, 'dine-in', 9, [['chickenSandwich', 1, '', 'ready'], ['icedLatte', 1, 'No ice', 'served']]),
  ];
}

// Small deterministic generator so the seeded history is stable between reloads.
function random(seed) {
  let value = seed;
  return () => (value = (value * 16807) % 2147483647) / 2147483647;
}
const pick = (rand, list) => list[Math.floor(rand() * list.length)];

function historySeed(now, count = 47) {
  const rand = random(20261024);
  return Array.from({ length: count }, (_, index) => {
    const id = 1047 - index;
    const completedAt = now - (25 + index * 105 + Math.floor(rand() * 40)) * MINUTE;
    const prepMinutes = 8 + Math.floor(rand() * 12);
    const receivedAt = completedAt - prepMinutes * MINUTE;
    const lineCount = 1 + Math.floor(rand() * 3);
    const keys = [...new Set(Array.from({ length: lineCount }, () => pick(rand, dishKeys)))];
    const items = keys.map(key => [key, rand() > 0.75 ? 2 : 1, rand() > 0.55 ? pick(rand, dishes[key].notes) : '', 'served']);
    return order({ id, table: 1 + Math.floor(rand() * 12), type: rand() > 0.85 ? 'takeaway' : 'dine-in',
      receivedAt, acceptedAt: receivedAt + MINUTE, completedAt, items });
  });
}

export function createSeedOrders(now = Date.now()) {
  return [...activeSeed(now), ...historySeed(now)];
}

// Simulated arrival used by the demo feed; replace with a websocket/poll later.
export function createIncomingOrder(id, now = Date.now()) {
  const rand = random(id * 7919);
  const keys = [...new Set(Array.from({ length: 1 + Math.floor(rand() * 3) }, () => pick(rand, dishKeys)))];
  return order({ id, table: 1 + Math.floor(rand() * 12), type: rand() > 0.8 ? 'takeaway' : 'dine-in', receivedAt: now,
    items: keys.map(key => [key, rand() > 0.8 ? 2 : 1, rand() > 0.5 ? pick(rand, dishes[key].notes) : '', 'pending']) });
}

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
