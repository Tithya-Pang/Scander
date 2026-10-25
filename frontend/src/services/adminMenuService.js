
import { apiRequest } from './api';
import { getStaffSession } from './authSession';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getAuthHeaders() {
  const session = getStaffSession();

  if (!session?.access_token) {
    throw new Error('Please log in first.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getCategories() {
  const response = await apiRequest('/menu/categories', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return response.data;
}

export async function createCategory(data) {
  const response = await apiRequest('/menu/categories', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data,
  });

  return response.data;
}

export async function updateCategory(id, data) {
  const response = await apiRequest(`/menu/categories/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: data,
  });

  return response.data;
}

export async function deleteCategory(id) {
  return apiRequest(`/menu/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

// ==========================================
// MENU ITEMS
// ==========================================

export async function getMenuItems() {
  const response = await apiRequest('/menu/items', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return response.data;
}

export async function createMenuItem(data) {
  const response = await apiRequest('/menu/items', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data,
  });

  return response.data;
}

export async function updateMenuItem(id, data) {
  const response = await apiRequest(`/menu/items/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: data,
  });

  return response.data;
}

export async function updateMenuItemAvailability(
  id,
  available
) {
  const response = await apiRequest(
    `/menu/items/${id}/availability`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: {
        is_available: available,
      },
    }
  );

  return response.data;
}

export async function deleteMenuItem(id) {
  return apiRequest(`/menu/items/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

// ==========================================
// FOOD IMAGE UPLOAD
// ==========================================

export async function uploadMenuImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `${API_BASE_URL.replace(/\/$/, '')}/menu/images`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || 'Image upload failed.'
    );
  }

  if (!result.data?.image_url) {
    throw new Error('No image URL returned from the backend.');
  }

  return result.data.image_url;
}
