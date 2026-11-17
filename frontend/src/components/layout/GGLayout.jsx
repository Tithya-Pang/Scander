
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "../../styles/home.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/menu", label: "Menu" },
  { to: "/how-it-works", label: "Guide" },
  { to: "/contact", label: "Contact" },
];

export default function GGLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="gg-home">
      <header className="gg-header">
        <div className="gg-container gg-nav">
          {/* Restaurant branding */}
          <Link
            to="/"
            className="gg-brand"
            onClick={closeMenu}
            aria-label="Gather Grounds home"
          >
            <span className="gg-brand-symbol" aria-hidden="true">
              g<span>.</span>
            </span>

            <span className="gg-brand-words">
              <strong>GATHER GROUNDS</strong>
              <small>POWERED BY SCANDER</small>
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="gg-menu-toggle"
            aria-label={
              menuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={menuOpen}
            aria-controls="gg-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Public website navigation */}
          <nav
            id="gg-links"
            className={`gg-links ${menuOpen ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? "gg-active" : ""
                }
              >
                {label}
              </NavLink>
            ))}

            <Link
              to="/login"
              className="gg-mobile-login"
              onClick={closeMenu}
            >
              Staff Login →
            </Link>
          </nav>

          {/* Staff login */}
          <Link className="gg-nav-login" to="/login">
            Staff Login
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {/* Current page */}
      <Outlet />

      {/* Shared footer */}
      <footer className="gg-footer">
        <div className="gg-container gg-footer-content">
          <strong>GATHER GROUNDS</strong>

          <span>
            Your dining experience, powered by Scander.
          </span>

          <small>
            © {new Date().getFullYear()} Gather Grounds
          </small>
        </div>
      </footer>
    </div>
  );
}
