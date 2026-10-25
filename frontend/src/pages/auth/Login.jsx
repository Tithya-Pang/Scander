
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { loginStaff } from '../../services/authService';
import { saveStaffSession } from '../../services/authSession';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setLoading(true);

    try {
      const response = await loginStaff(
        email.trim(),
        password
      );

      // Supports both direct and data-wrapped responses.
      const result = response.data ?? response;

      const accessToken = result.access_token;
      const user = result.user;

      if (!accessToken || !user?.role) {
        throw new Error('Invalid login response');
      }

      if (
        user.role !== 'ADMIN' &&
        user.role !== 'KITCHEN_STAFF'
      ) {
        setMessage('Your account does not have staff access.');
        return;
      }

      saveStaffSession(accessToken, user);

      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/kitchen', { replace: true });
      }

    } catch (error) {
      console.error('Login failed:', error);

      if (error.status === 400 || error.status === 401) {
        setMessage('Incorrect email or password.');
      } else {
        setMessage(
          'Unable to sign in. Please check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section
        className="card login-card"
        aria-labelledby="login-title"
      >
        <Link to="/" className="brand">
          Gather Grounds<span>.</span>
        </Link>

        <h1 id="login-title">Staff sign in</h1>

        <p className="muted">
          Use your assigned administrator or kitchen staff account.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {message && <p role="alert">{message}</p>}
      </section>
    </main>
  );
}

