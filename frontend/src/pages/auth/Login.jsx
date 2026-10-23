import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('Sign-in is not connected yet. Account access will be determined by your authenticated role.');
  }

  return <main className="login-page">
    <section className="card login-card" aria-labelledby="login-title">
      <Link to="/" className="brand">Gather Grounds<span>.</span></Link>
      <h1 id="login-title">Staff sign in</h1>
      <p className="muted">Use your assigned administrator or kitchen staff account.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>
      <p role="status">{message}</p>
      <p className="muted note">Frontend preview · authentication is not connected.</p>
    </section>
  </main>;
}
