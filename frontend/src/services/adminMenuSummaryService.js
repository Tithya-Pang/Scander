
import { apiRequest } from './api';
import { getStaffSession } from './authSession';

function getAuthHeaders() {
  const session = getStaffSession();

  if (!session?.access_token) {
    throw new Error('Please log in first.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function fetchMenuSummary() {
  const headers = getAuthHeaders();

  const [itemsResponse, categoriesResponse] = await Promise.all([
    apiRequest('/menu/items', { headers }),
    apiRequest('/menu/categories', { headers }),
  ]);

  const items = itemsResponse.data;
  const categories = categoriesResponse.data;

  if (!Array.isArray(items) || !Array.isArray(categories)) {
    throw new Error('Unexpected menu API response');
  }

  const activeItems = items.filter(item => item.is_active === true);

  const availableItems = activeItems.filter(
    item => item.is_available === true
  );

  const soldOutItems = activeItems.filter(
    item => item.is_available === false
  );

  const activeCategories = categories.filter(
    category => category.is_active === true
  );

  return {
    totalItems: activeItems.length,
    availableItems: availableItems.length,
    soldOutItems: soldOutItems.length,
    totalCategories: activeCategories.length,
  };
}
