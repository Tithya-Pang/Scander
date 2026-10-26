import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrder } from '../src/utils/orderValidation.js';
const uuid = '12345678-1234-4234-9234-123456789abc';
const valid = () => ({ tableToken: uuid, requestId: uuid, receiptToken: uuid,
  items: [{ itemId: 2, quantity: 1, priceCents: 295 }], instructions: ' No ice ' });
test('accepts bounded quantities and trims notes; ignores client totals', () => {
  const body = { ...valid(), total: 0, role: 'ADMIN' };
  const result = validateOrder(body);
  assert.deepEqual(result.items, [{ item_id: 2, quantity: 1, price_cents: 295 }]);
  assert.equal(result.instructions, 'No ice');
  assert.equal(result.total, undefined);
});
test('rejects unverified tables, empty carts, duplicate items, invalid quantities and prices', () => {
  for (const override of [
    { tableToken: '1' }, { requestId: '' }, { receiptToken: '' }, { items: [] },
    { items: Array(51).fill(valid().items[0]) },
    { items: [valid().items[0], valid().items[0]] },
    ...[0, -1, 1.5, 21, '2'].map(quantity => ({ items: [{ ...valid().items[0], quantity }] })),
    ...[-1, 2.95, NaN, '295'].map(priceCents => ({ items: [{ ...valid().items[0], priceCents }] })),
    { instructions: 'x'.repeat(501) }, { instructions: {} },
  ]) assert.throws(() => validateOrder({ ...valid(), ...override }), error => error.status === 400);
});
