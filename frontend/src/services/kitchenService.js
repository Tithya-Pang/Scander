
import { apiRequest } from './api';
import { getStaffSession } from './authSession';

function authHeaders() {
  const token = getStaffSession()?.access_token;

  if (!token) {
    const error = new Error(
      'Your staff session has expired. Please sign in again.'
    );
    error.status = 401;
    throw error;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function parseId(value, label) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Invalid ${label} ID.`);
  }

  return id;
}

// Backend dish status -> kitchen screen dish status.
const ITEM_STATUS = {
  RECEIVED: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
};

const toTime = value => (value ? new Date(value).getTime() : null);

function toKitchenItem(item, accepted) {
  // Once an order is accepted, a dish still marked RECEIVED is on the line.
  const status =
    accepted && item.status === 'RECEIVED'
      ? 'preparing'
      : ITEM_STATUS[item.status] ?? 'pending';

  return {
    lineId: item.order_item_id,
    itemId: item.item_id ?? null,
    name: item.item_name,
    price: Number(item.unit_price ?? 0),
    image: item.image_url || null,
    qty: item.quantity,
    note: item.special_instruction || '',
    status,
    apiStatus: item.status,
    preparingAt: toTime(item.preparing_at),
    servedAt: toTime(item.served_at),
  };
}

// Map one backend order to the shape the kitchen screens already use.
export function toKitchenOrder(order) {
  const accepted = order.status !== 'RECEIVED';
  const items = (order.items ?? [])
    .filter(item => item.status !== 'CANCELLED')
    .map(item => toKitchenItem(item, accepted));
  const receivedAt = toTime(order.ordered_at);
  const startTimes = items.map(item => item.preparingAt).filter(Boolean);
  const servedTimes = items.map(item => item.servedAt).filter(Boolean);

  return {
    id: order.order_id,
    number: order.order_number || String(order.order_id),
    status: order.status,
    table: order.table_number ?? order.table_id,
    type: 'dine-in',
    note: order.customer_note || '',
    totalAmount:
      order.total_amount != null ? Number(order.total_amount) : null,
    receivedAt,
    acceptedAt: accepted
      ? (startTimes.length ? Math.min(...startTimes) : receivedAt)
      : null,
    completedAt:
      order.status === 'SERVED'
        ? toTime(order.completed_at) ??
          (servedTimes.length ? Math.max(...servedTimes) : receivedAt)
        : null,
    cancelled: order.status === 'CANCELLED',
    items,
  };
}

function requireOrder(response) {
  if (!response?.data || !Array.isArray(response.data.items)) {
    throw new Error('Invalid kitchen order response from backend.');
  }

  return toKitchenOrder(response.data);
}

// Get every order currently in the kitchen (Received, Preparing, Ready).
export async function getKitchenOrders() {
  const response = await apiRequest('/kitchen/orders', {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!Array.isArray(response?.data)) {
    throw new Error('Invalid kitchen orders response from backend.');
  }

  return response.data.map(toKitchenOrder);
}

// Get one order with its dishes, whatever its status.
export async function getKitchenOrder(orderId) {
  const id = parseId(orderId, 'order');

  const response = await apiRequest(`/kitchen/orders/${id}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return requireOrder(response);
}

// Get a page of finished (served or cancelled) orders, newest first.
export async function getKitchenHistory(page = 1, limit = 100) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiRequest(
    `/kitchen/history?${params.toString()}`,
    {
      method: 'GET',
      headers: authHeaders(),
    }
  );

  if (!Array.isArray(response?.data)) {
    throw new Error('Invalid kitchen history response from backend.');
  }

  return {
    orders: response.data.map(toKitchenOrder),
    pagination: response.pagination ?? null,
  };
}

// Change a whole order's status. Resolves with the updated order.
export async function updateKitchenOrderStatus(orderId, status) {
  const id = parseId(orderId, 'order');

  const response = await apiRequest(`/kitchen/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: { status },
  });

  return requireOrder(response);
}

// Change one dish's status. Resolves with the dish's updated order.
export async function updateKitchenItemStatus(itemId, status) {
  const id = parseId(itemId, 'order item');

  const response = await apiRequest(`/kitchen/items/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: { status },
  });

  return requireOrder(response);
}

// Turn a failed request into a message kitchen staff can act on.
export function kitchenErrorMessage(error) {
  if (error?.status === 401) {
    return 'Your staff session has expired. Please sign in again.';
  }

  if (error?.status === 403) {
    return error.body?.message === 'Invalid staff restaurant assignment'
      ? 'Your account is not assigned to a restaurant.'
      : 'Your account does not have kitchen access.';
  }

  if (error?.status === 404) {
    return 'That order no longer exists.';
  }

  if (error?.status === 409) {
    return error.body?.message
      ? `Status change rejected: ${error.body.message}`
      : 'That order was already updated. Refreshing…';
  }

  if (error?.status) {
    return error.body?.message || 'The kitchen server could not complete that request.';
  }

  if (error instanceof TypeError) {
    return 'Cannot reach the kitchen server. Check your connection.';
  }

  return error?.message || 'Something went wrong.';
}
