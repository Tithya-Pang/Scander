// Receipts grant access to one order. Keep tokens out of URLs and browser logs.
const key = tableToken => `scander:receipt:${tableToken}`;
export function saveReceipt(tableToken, receipt) {
  try { sessionStorage.setItem(key(tableToken), JSON.stringify(receipt)); } catch { /* Navigation state still carries the receipt in this tab. */ }
}
export function readReceipt(tableToken) {
  try { const data = JSON.parse(sessionStorage.getItem(key(tableToken))); return data?.id && data?.token ? data : null; } catch { return null; }
}
export function savePending(tableToken, pending) {
  // Refuse submission if credentials cannot be retained for a safe retry after a network failure.
  sessionStorage.setItem(`${key(tableToken)}:pending`, JSON.stringify(pending));
}
export function readPending(tableToken) {
  try { return JSON.parse(sessionStorage.getItem(`${key(tableToken)}:pending`)); } catch { return null; }
}
export function clearPending(tableToken) {
  try { sessionStorage.removeItem(`${key(tableToken)}:pending`); } catch { /* Already saved receipt. */ }
}
export function createRequestId() {
  // Works on LAN HTTP, where crypto.randomUUID may be unavailable.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
