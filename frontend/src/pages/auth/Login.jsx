
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginStaff } from "../../services/authService";
import {
  saveStaffSession,
  getStaffSession,
  clearStaffSession,
} from "../../services/authSession";
import "../../styles/login.css";

// ----------------------------------------
// Existing authentication helpers
// ----------------------------------------

function getDashboardPath(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "KITCHEN_STAFF") return "/kitchen";
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
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    return (
      typeof payload.exp === "number" &&
      payload.exp * 1000 > Date.now()
    );
  } catch {
    return false;
  }
}

// ----------------------------------------
// Icons
// ----------------------------------------

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {hidden && <path d="M3 21 21 3" />}
    </svg>
  );
}

// ----------------------------------------
// Login Component
// ----------------------------------------

export default function Login() {
  const navigate = useNavigate();

  const [currentSession, setCurrentSession] = useState(() => {
    const session = getStaffSession();
    return isSessionValid(session) ? session : null;
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSwitchAccount() {
    clearStaffSession();
    setCurrentSession(null);
    setEmail("");
    setPassword("");
    setMessage("");
  }

  function handleContinue() {
    if (!currentSession) return;

    const destination = getDashboardPath(
      currentSession.user.role
    );

    if (destination) {
      navigate(destination, { replace: true });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await loginStaff(
        email.trim(),
        password
      );

      const result = response.data ?? response;
      const accessToken = result.access_token;
      const user = result.user;

      if (!accessToken || !user?.role) {
        throw new Error("Invalid login response");
      }

      const destination = getDashboardPath(user.role);

      if (!destination) {
        setMessage(
          "Your account does not have staff access."
        );
        return;
      }

      saveStaffSession(accessToken, user);

      setCurrentSession({
        access_token: accessToken,
        user,
      });

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);

      if (
        error.status === 400 ||
        error.status === 401
      ) {
        setMessage("Incorrect email or password.");
      } else {
        setMessage(
          "Unable to sign in. Check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gg-login">
      {/* LEFT: RESTAURANT BRANDING */}
      <section className="gg-login-visual">
        <Link to="/" className="gg-login-back">
          <span aria-hidden="true">←</span> Back to website
        </Link>

        <div className="gg-login-visual-content">
          <div className="gg-login-visual-mark">
            <span>GG</span>
          </div>

          <p className="gg-login-visual-kicker">
            GATHER GROUNDS
          </p>

          <h2>
            Great service starts
            <br />
            behind the scenes.
          </h2>

          <p className="gg-login-visual-description">
            One connected workspace for smoother restaurant
            operations, better coordination, and great
            dining experiences.
          </p>

          <div className="gg-login-visual-divider" />

          <span className="gg-login-powered">
            POWERED BY <strong>SCANDER.</strong>
          </span>
        </div>

        <span className="gg-login-visual-footer">
          Gather Grounds Restaurant Management
        </span>
      </section>

      {/* RIGHT: STAFF LOGIN */}
      <section className="gg-login-panel">
        <div className="gg-login-panel-top">
          <Link to="/" className="gg-login-mobile-brand">
            Gather Grounds<span>.</span>
          </Link>

          <span className="gg-login-staff-tag">
            <span className="gg-login-tag-dot" />
            STAFF PORTAL
          </span>
        </div>

        <div className="gg-login-form-container">
          <div className="gg-login-brand">
            <div className="gg-login-brand-icon">S</div>
            <span>scander<span>.</span></span>
          </div>

          {currentSession ? (
            <>
              <div className="gg-login-heading">
                <span className="gg-login-eyebrow">
                  WELCOME BACK
                </span>
                <h1>You're signed in.</h1>
                <p>
                  Your workspace is ready whenever you are.
                </p>
              </div>

              <div className="gg-login-session">
                <div className="gg-login-avatar">
                  {currentSession.user.role === "ADMIN"
                    ? "A"
                    : "K"}
                </div>

                <div>
                  <strong>
                    {currentSession.user.role === "ADMIN"
                      ? "Administrator"
                      : "Kitchen Staff"}
                  </strong>

                  <span>
                    {currentSession.user.email ||
                      "Staff account"}
                  </span>
                </div>
              </div>

              <button
                className="gg-login-submit"
                type="button"
                onClick={handleContinue}
              >
                Continue to Dashboard
                <span aria-hidden="true">→</span>
              </button>

              <button
                className="gg-login-switch"
                type="button"
                onClick={handleSwitchAccount}
              >
                Sign in with another account
              </button>
            </>
          ) : (
            <>
              <div className="gg-login-heading">
                <span className="gg-login-eyebrow">
                  STAFF ACCESS
                </span>

                <h1>Welcome back.</h1>

                <p>
                  Sign in to manage your Gather Grounds
                  workspace.
                </p>
              </div>

              <form
                className="gg-login-form"
                onSubmit={handleSubmit}
              >
                <div className="gg-login-field">
                  <label htmlFor="email">
                    Email address
                  </label>

                  <div className="gg-login-input-wrap">
                    <MailIcon />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@gathergrounds.com"
                      autoComplete="username"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="gg-login-field">
                  <label htmlFor="password">
                    Password
                  </label>

                  <div className="gg-login-input-wrap">
                    <LockIcon />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="gg-login-eye"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={showPassword}
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                    >
                      <EyeIcon hidden={showPassword} />
                    </button>
                  </div>
                </div>

                {message && (
                  <p className="gg-login-error" role="alert">
                    {message}
                  </p>
                )}

                <button
                  className="gg-login-submit"
                  type="submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? "Signing in..."
                      : "Sign In to Workspace"}
                  </span>

                  {!loading && (
                    <span aria-hidden="true">→</span>
                  )}
                </button>
              </form>

              <p className="gg-login-help">
                Need account access? Contact your
                restaurant administrator.
              </p>
            </>
          )}
        </div>

        <div className="gg-login-panel-footer">
          <span>© {new Date().getFullYear()} Gather Grounds</span>
          <span>Powered by Scander</span>
        </div>
      </section>
    </main>
  );
}
