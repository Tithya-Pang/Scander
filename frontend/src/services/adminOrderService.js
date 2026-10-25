
import { apiRequest } from './api';
import { getStaffSession } from './authSession';

function authHeaders() {
  const token = getStaffSession()?.access_token;

  if (!token) {
    throw new Error(
      'Your staff session has expired. Please sign in again.'
    );
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// Get a paginated list of orders.
export async function getAdminOrders(page = 1, limit = 10) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiRequest(
    `/admin/orders?${params.toString()}`,
    {
      method: 'GET',
      headers: authHeaders(),
    }
  );

  if (!Array.isArray(response?.data)) {
    throw new Error(
      'Invalid orders response from backend.'
    );
  }

  return {
    orders: response.data,
    pagination: response.pagination ?? null,
  };
}

// Get one order together with all of its dishes.
export async function getAdminOrderDetails(orderId) {
  const id = Number(orderId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Invalid order ID.');
  }

  const response = await apiRequest(
    `/admin/orders/${id}`,
    {
      method: 'GET',
      headers: authHeaders(),
    }
  );

  if (
    !response?.data ||
    !Array.isArray(response.data.items)
  ) {
    throw new Error(
      'Invalid order details response from backend.'
    );
  }

  return response.data;
}
