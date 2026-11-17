import { createHash } from 'node:crypto';
import { adminSupabase } from '../config/supabase.js';
import { orderError } from '../utils/orderValidation.js';

const hash = value => createHash('sha256').update(value).digest('hex');
export function restaurantId() {
  const id = process.env.RESTAURANT_ID;
  if (!id || !/^[1-9]\d*$/.test(id)) throw orderError(503, 'Restaurant configuration is missing.');
  return id;
}
export async function resolveTable(token) {
  const { data, error } = await adminSupabase.from('restaurant_table')
    .select('table_id,table_number').eq('restaurant_id', restaurantId()).eq('qr_token', token).eq('is_active', true).maybeSingle();
  if (error) throw error;
  if (!data) throw orderError(404, 'This table QR code is unavailable. Please ask a staff member for help.');
  return { id: data.table_id, number: data.table_number };
}
export async function submitOrder(order) {
  const fingerprint = hash(JSON.stringify({ table: order.tableToken, items: order.items, instructions: order.instructions }));
  const { data, error } = await adminSupabase.rpc('scander_submit_order', {
    p_restaurant_id: restaurantId(), p_qr_token: order.tableToken, p_request_id: order.requestId,
    p_tracking_hash: hash(order.receiptToken), p_fingerprint: fingerprint,
    p_items: order.items, p_note: order.instructions,
  });
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42703') throw orderError(503, 'Order setup is not installed yet. Please ask staff to complete database setup.');
    if (['P0001', '22023'].includes(error.code)) throw orderError(409, error.message);
    throw error;
  }
  return getOrder(data.order_id, order.receiptToken);
}
export async function getOrder(id, receiptToken) {
  const { data: order, error } = await adminSupabase.from('customer_order')
    .select('order_id,order_number,table_id,status,customer_note,ordered_at,subtotal_amount,tax_amount,total_amount')
    .eq('restaurant_id', restaurantId()).eq('order_id', id).eq('tracking_token_hash', hash(receiptToken)).maybeSingle();
  if (error) throw error;
  if (!order) throw orderError(404, 'Order not found for this receipt.');
  const [items, table] = await Promise.all([
    adminSupabase.from('order_item').select('order_item_id,item_id,item_name,quantity,unit_price,status')
      .eq('restaurant_id', restaurantId()).eq('order_id', id).order('order_item_id'),
    adminSupabase.from('restaurant_table').select('table_number').eq('restaurant_id', restaurantId()).eq('table_id', order.table_id).single(),
  ]);
  if (items.error) throw items.error;
  if (table.error) throw table.error;
  return { id: order.order_id, number: order.order_number, table: table.data.table_number,
    status: order.status, orderedAt: order.ordered_at, instructions: order.customer_note || '',
    subtotal: Number(order.subtotal_amount), tax: Number(order.tax_amount), total: Number(order.total_amount),
    count: items.data.reduce((sum, item) => sum + item.quantity, 0),
    items: items.data.map(item => ({ id: item.order_item_id, itemId: item.item_id, name: item.item_name, quantity: item.quantity, price: Number(item.unit_price), status: item.status })) };
}
