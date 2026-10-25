
import { apiRequest } from './api';
import { getStaffSession } from './authSession';

// Reuse the logged-in Admin's access token.
function getAuthHeaders() {
  const session = getStaffSession();

  if (!session?.access_token) {
    throw new Error('Please log in first.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

// Retrieve dashboard summary statistics.
export async function fetchDashboardStats() {
  const response = await apiRequest('/admin/dashboard/stats', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return response.data;
}

// Retrieve order trends and status distribution.
export async function fetchDashboardAnalytics() {
  const response = await apiRequest('/admin/dashboard/analytics', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return response.data;
}

// Retrieve the top five popular dishes.
export async function fetchPopularDishes() {
  const response = await apiRequest(
    '/admin/dashboard/popular-dishes',
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function fetchRecentOrders() {
  const response = await apiRequest('/admin/orders', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return response.data;
}