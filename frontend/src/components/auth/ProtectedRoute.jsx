
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getStaffSession } from '../../services/authSession';

export default function ProtectedRoute({ allowedRole }) {
  const location = useLocation();
  const session = getStaffSession();

  // No login session: redirect to login.
  if (!session?.access_token || !session?.user?.role) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check token expiration, if it is a JWT.
  try {
    const payload = JSON.parse(
      atob(session.access_token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/'))
    );

    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong staff role.
  if (session.user.role !== allowedRole) {
    const destination =
      session.user.role === 'ADMIN'
        ? '/admin'
        : session.user.role === 'KITCHEN_STAFF'
          ? '/kitchen'
          : '/login';

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
