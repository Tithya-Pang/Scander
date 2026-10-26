import { useState } from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { loginStaff } from '../../services/authService';

import {
  saveStaffSession,
  getStaffSession,
  clearStaffSession,
} from '../../services/authSession';

// ==========================================
// HELPERS
// ==========================================

function getDashboardPath(role) {
  if (role === 'ADMIN') {
    return '/admin';
  }

  if (role === 'KITCHEN_STAFF') {
    return '/kitchen';
  }

  return null;
}

function isSessionValid(session) {
  if (
    !session?.access_token ||
    !getDashboardPath(session?.user?.role)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      atob(
        session.access_token
          .split('.')[1]
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

// ==========================================
// LOGIN PAGE
// ==========================================

export default function Login() {
  const navigate = useNavigate();

  // Check whether a valid staff session exists.
  const [currentSession, setCurrentSession] =
    useState(() => {
      const session = getStaffSession();

      return isSessionValid(session)
        ? session
        : null;
    });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ==========================================
  // SWITCH ACCOUNT
  // ==========================================

  function handleSwitchAccount() {
    clearStaffSession();

    setCurrentSession(null);
    setEmail('');
    setPassword('');
    setMessage('');
  }

  // ==========================================
  // CONTINUE EXISTING SESSION
  // ==========================================

  function handleContinue() {
    if (!currentSession) return;

    const path = getDashboardPath(
      currentSession.user.role
    );

    if (path) {
      navigate(path, { replace: true });
    }
  }

  // ==========================================
  // STAFF LOGIN
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setLoading(true);

    try {
      const response = await loginStaff(
        email.trim(),
        password
      );

      // Support both direct and wrapped API responses.
      const result = response.data ?? response;

      const accessToken = result.access_token;
      const user = result.user;

      if (!accessToken || !user?.role) {
        throw new Error('Invalid login response');
      }

      const destination = getDashboardPath(
        user.role
      );

      if (!destination) {
        setMessage(
          'Your account does not have staff access.'
        );
        return;
      }

      saveStaffSession(accessToken, user);

      setCurrentSession({
        access_token: accessToken,
        user,
      });

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error('Login failed:', error);

      if (
        error.status === 400 ||
        error.status === 401
      ) {
        setMessage(
          'Incorrect email or password.'
        );
      } else {
        setMessage(
          'Unable to sign in. Please check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="login-page">
      <section
        className="card login-card"
        aria-labelledby="login-title"
      >

        {/* BRAND */}
        <Link to="/" className="brand">
          Gather Grounds<span>.</span>
        </Link>

        {currentSession ? (
          // ==================================
          // ALREADY LOGGED IN
          // ==================================
          <>
            <h1 id="login-title">
              Welcome back
            </h1>

            <p className="muted">
              You are already signed in to Scander.
            </p>

            <div
              style={{
                padding: 16,
                margin: '18px 0',
                borderRadius: 12,
                background: '#f3f7f5',
                border: '1px solid #e3ece7',
              }}
            >
              <strong>
                {currentSession.user.role === 'ADMIN'
                  ? 'Administrator'
                  : 'Kitchen Staff'}
              </strong>

              <p
                className="muted"
                style={{ marginTop: 6 }}
              >
                {currentSession.user.email ||
                  'Staff account'}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleContinue}
              style={{ width: '100%' }}
            >
              Continue to Dashboard
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSwitchAccount}
              style={{
                width: '100%',
                marginTop: 12,
              }}
            >
              Switch Account
            </button>
          </>
        ) : (
          // ==================================
          // LOGIN FORM
          // ==================================
          <>
            <h1 id="login-title">
              Staff sign in
            </h1>

            <p className="muted">
              Use your assigned administrator
              or kitchen staff account.
            </p>

            <form onSubmit={handleSubmit}>

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={event =>
                  setEmail(event.target.value)
                }
                required
                disabled={loading}
              />

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event =>
                  setPassword(event.target.value)
                }
                required
                disabled={loading}
              />

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Signing in...'
                  : 'Sign in'}
              </button>
            </form>

            {message && (
              <p role="alert">
                {message}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

