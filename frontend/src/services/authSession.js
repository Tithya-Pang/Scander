
const SESSION_KEY = 'scander_staff_session';

// Save the logged-in staff member's session.
export function saveStaffSession(accessToken, user) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      access_token: accessToken,
      user,
    })
  );
}

// Retrieve the current session.
export function getStaffSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Clear session during logout.
export function clearStaffSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
