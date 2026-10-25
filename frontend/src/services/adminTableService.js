
import { apiRequest } from './api';
import { getStaffSession } from './authSession';

// ==========================================
// AUTHENTICATION
// ==========================================

function getAuthHeaders() {
  const session = getStaffSession();

  if (!session?.access_token) {
    throw new Error(
      'Your session has expired. Please sign in again.'
    );
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

// ==========================================
// GET ALL RESTAURANT TABLES
// ==========================================

export async function getAdminTables() {
  const response = await apiRequest('/admin/tables', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!Array.isArray(response?.data)) {
    throw new Error('Invalid table data returned by server.');
  }

  return response.data;
}

// ==========================================
// GET ONE TABLE
// ==========================================

export async function getAdminTableById(tableId) {
  const response = await apiRequest(
    `/admin/tables/${tableId}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

// ==========================================
// CREATE TABLE
// ==========================================

export async function createAdminTable(tableNumber) {
  const response = await apiRequest('/admin/tables', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: {
      table_number: tableNumber.trim(),
    },
  });

  return response.data;
}

// ==========================================
// UPDATE TABLE NUMBER
// ==========================================

export async function updateAdminTable(
  tableId,
  tableNumber
) {
  const response = await apiRequest(
    `/admin/tables/${tableId}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: {
        table_number: tableNumber.trim(),
      },
    }
  );

  return response.data;
}

// ==========================================
// ACTIVATE / DEACTIVATE TABLE
// ==========================================

export async function setAdminTableActive(
  tableId,
  isActive
) {
  const response = await apiRequest(
    `/admin/tables/${tableId}/active`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: {
        is_active: isActive,
      },
    }
  );

  return response.data;
}
