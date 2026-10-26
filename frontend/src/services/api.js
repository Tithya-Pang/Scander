export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/+$/, '');

// Call from feature services when the Express API is available.
// Authentication headers can be supplied through options.headers later.
export async function apiRequest(path, { body, headers, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try { const body = await response.json(); if (typeof body.message === 'string') message = body.message; } catch { /* Non-JSON gateway error. */ }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
