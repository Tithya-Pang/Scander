import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  getStaffSession,
} from '../../services/authSession';

// Check whether the login token is still valid.
function isTokenValid(token) {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const payload = JSON.parse(
      atob(
        token.split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      )
    );

    return (
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now()
    );
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ allowedRole }) {
  const location = useLocation();
  const session = getStaffSession();

  // 1. User is not logged in.
  if (
    !session?.access_token ||
    !session?.user?.role
  ) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 2. Login token has expired.
  if (!isTokenValid(session.access_token)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // 3. Check account role.
  const role = session.user.role;

  if (role !== allowedRole) {
    // Admin cannot enter Kitchen pages.
    if (role === 'ADMIN') {
      return (
        <Navigate to="/admin" replace />
      );
    }

    // Kitchen staff cannot enter Admin pages.
    if (role === 'KITCHEN_STAFF') {
      return (
        <Navigate to="/kitchen" replace />
      );
    }

    return <Navigate to="/login" replace />;
  }

  // 4. Correct role: allow access.
  return <Outlet />;
}

