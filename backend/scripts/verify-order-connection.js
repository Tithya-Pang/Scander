// Creates a uniquely marked integration-test order, verifies it, then removes only that order.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { adminSupabase, createSupabaseClient } from '../src/config/supabase.js';
import { getRestaurantMenu } from '../src/services/menu.js';
import { validateOrder } from '../src/utils/orderValidation.js';
import { submitOrder, getOrder } from '../src/services/order.js';

const tables = JSON.parse(await readFile(process.argv[2] || '/tmp/scander-active-tables.json', 'utf8'));
const menu = await getRestaurantMenu(process.env.RESTAURANT_ID);
assert(menu?.items.length, 'Add an available database menu item first.');
assert(tables.length, 'Add an active database table first.');
const item = menu.items[0];
const requestIds = [randomUUID(), randomUUID()];
const token = randomUUID();
const body = { tableToken: tables[0].token, requestId: requestIds[0], receiptToken: token,
  items: [{ itemId: item.id, quantity: 2, priceCents: Math.round(item.price * 100) }],
  instructions: 'Scander connection verification — temporary test order' };
try {
  const order = await submitOrder(validateOrder(body));
  assert.equal(order.status, 'RECEIVED');
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].name, item.name);
  assert.equal(order.items[0].quantity, 2);
  const subtotalCents = Math.round(item.price * 100) * 2;
  assert.equal(Math.round(order.total * 100), subtotalCents + Math.round(subtotalCents * .08));
  const retry = await submitOrder(validateOrder(body));
  assert.equal(retry.id, order.id, 'Retry must return the same order');
  await assert.rejects(() => getOrder(order.id, randomUUID()), error => error.status === 404);
  // A failure later in the item list must leave no partial order or order items.
  const invalid = { ...body, requestId: requestIds[1], items: [...body.items, { itemId: 2147483647, quantity: 1, priceCents: 1 }] };
  await assert.rejects(() => submitOrder(validateOrder(invalid)), error => error.status === 409);
  const result = await adminSupabase.from('customer_order').select('order_id').eq('request_id', requestIds[1]);
  if (result.error) throw result.error;
  assert.equal(result.data.length, 0);
  // Browser/public clients must not be able to call the privileged order writer.
  const denied = await createSupabaseClient().rpc('scander_submit_order', {
    p_restaurant_id: Number(process.env.RESTAURANT_ID), p_qr_token: tables[0].token,
    p_request_id: randomUUID(), p_tracking_hash: 'a'.repeat(64), p_fingerprint: 'b'.repeat(64),
    p_items: [{ item_id: item.id, quantity: 1, price_cents: Math.round(item.price * 100) }], p_note: 'must be denied',
  });
  assert(denied.error, 'Public clients must not be allowed to write orders');
  console.log('PASS: live order and item saved, authoritative totals, duplicate retry prevented, invalid receipt rejected, failed order rolled back, public RPC denied.');
} finally {
  const cleanup = await adminSupabase.from('customer_order').delete()
    .eq('restaurant_id', process.env.RESTAURANT_ID).in('request_id', requestIds);
  if (cleanup.error) throw new Error(`Test cleanup failed: ${cleanup.error.code}`);
  console.log('Removed only this verification run’s temporary test orders.');
}
