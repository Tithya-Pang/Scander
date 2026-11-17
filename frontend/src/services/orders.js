import { apiRequest } from './api';

export const getMenu = options => apiRequest('menu', options).then(response => response.data);
export const getTable = (token, options) => apiRequest(`orders/table/${encodeURIComponent(token)}`, options).then(response => response.data);
export const placeOrder = order => apiRequest('orders', { method: 'POST', body: order }).then(response => response.data);
export const getOrder = (receipt, options = {}) => apiRequest(`orders/${receipt.id}`, {
  ...options, headers: { 'X-Order-Token': receipt.token },
}).then(response => response.data);
