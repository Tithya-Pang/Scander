
import { useEffect, useState } from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useLocation
} from 'react-router-dom';

import Icon from '../common/Icon';

// ==========================================
// ADMIN NAVIGATION
// ==========================================

const navigation = [
  {
    section: 'OVERVIEW',
    links: [
      {
        to: '/admin',
        label: 'Dashboard',
        icon: 'grid',
        end: true
      }
    ]
  },
  {
    section: 'MANAGEMENT',
    links: [
      {
        to: '/admin/menu',
        label: 'Menu Items',
        icon: 'utensils'
      },
      {
        to: '/admin/categories',
        label: 'Categories',
        icon: 'menu'
      },
      {
        to: '/admin/orders',
        label: 'Orders',
        icon: 'bag'
      },
      {
        to: '/admin/tables',
        label: 'Tables',
        icon: 'grid'
      },
      {
        to: '/admin/payments',
        label: 'Payments',
        icon: 'file'
      }
    ]
  },
  {
    section: 'ANALYTICS',
    links: [
      {
        to: '/admin/reports',
        label: 'Sales Reports',
        icon: 'calendar'
      }
    ]
  },
  {
    section: 'PREFERENCES',
    links: [
      {
        to: '/admin/settings',
        label: 'Settings',
        icon: 'settings'
      }
    ]
  }
];

// ==========================================
// PAGE TITLES
// ==========================================

const pageTitles = {
  '/admin': 'Dashboard Overview',
  '/admin/menu': 'Menu Management',
  '/admin/categories': 'Category Management',
  '/admin/orders': 'Order Management',
  '/admin/tables': 'Table Management',
  '/admin/payments': 'Payment Management',
  '/admin/reports': 'Sales Reports',
  '/admin/settings': 'Settings'
};

// ==========================================
// SETTINGS
// ==========================================

const SETTINGS_KEY = 'scander.admin.settings.v1';

function getSavedDensity() {
  try {
    const settings = JSON.parse(
      localStorage.getItem(SETTINGS_KEY)
    );

    return settings?.density === 'compact'
      ? 'compact'
      : 'comfortable';
  } catch {
    return 'comfortable';
  }
}

// ==========================================
// ADMIN LAYOUT
// ==========================================

export default function AdminLayout() {
  const { pathname } = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [density, setDensity] = useState(getSavedDensity);

  const pageTitle =
    pageTitles[pathname] || 'Admin Workspace';

  // Apply the saved display preference.
  useEffect(() => {
    const shell = document.querySelector('.admin-shell');

    if (shell) {
      shell.setAttribute('data-density', density);
    }
  }, [density]);

  // Reload the saved preference when the user
  // navigates back from Admin Settings.
  useEffect(() => {
    setDensity(getSavedDensity());
  }, [pathname]);

  // Close the mobile sidebar when navigation changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div
      className="admin-shell"
      data-density={density}
    >
      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside
        id="admin-navigation"
        className={`a-sidebar ${
          sidebarOpen ? 'a-sidebar-open' : ''
        }`}
      >
        {/* Brand */}

        <Link
          to="/admin"
          className="a-brand"
          onClick={() => setSidebarOpen(false)}
        >
          <span className="a-brand-mark">
            <Icon name="coffee" size={27} />
          </span>

          <span className="a-brand-text">
            <strong>
              Gather Grounds<span>.</span>
            </strong>

            <small>Admin Workspace</small>
          </span>
        </Link>

        {/* Restaurant workspace label */}

        <div className="a-workspace-badge">
          <span className="a-workspace-dot" />
          Restaurant Management
        </div>

        {/* Navigation */}

        <nav
          className="a-navigation"
          aria-label="Admin navigation"
        >
          {navigation.map(group => (
            <div
              className="a-nav-group"
              key={group.section}
            >
              <span className="a-nav-heading">
                {group.section}
              </span>

              {group.links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `a-nav-link${isActive ? ' active' : ''}`
                  }
                >
                  <Icon
                    name={link.icon}
                    size={20}
                  />

                  <span>{link.label}</span>

                  <Icon
                    name="chevronRight"
                    size={15}
                    className="a-nav-arrow"
                  />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ==================================
            SIDEBAR FOOTER
        ================================== */}

        <div className="a-sidebar-bottom">

          {/* Demo notice */}

          <div className="a-sidebar-notice">
            <span className="a-notice-icon">
              <Icon name="checkCircle" size={18} />
            </span>

            <div>
              <strong>Frontend Preview</strong>

              <small>
                Sample data · No backend connected
              </small>
            </div>
          </div>

          {/* Admin profile */}

          <div className="a-profile">
            <span className="a-avatar">
              <Icon name="user" size={21} />
            </span>

            <div className="a-profile-text">
              <strong>Restaurant Admin</strong>
              <small>Administrator · Demo</small>
            </div>

            <Link
              to="/login"
              title="Open staff sign-in preview"
              aria-label="Open staff sign-in preview"
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name="logout" size={19} />
            </Link>
          </div>

        </div>
      </aside>

      {/* ==================================
          MOBILE SIDEBAR BACKDROP
      ================================== */}

      {sidebarOpen && (
        <button
          type="button"
          className="a-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* ==================================
          MAIN WORKSPACE
      ================================== */}

      <div className="a-workspace-main">

        {/* Top navigation bar */}

        <header className="a-topbar">

          <div className="a-topbar-left">

            {/* Mobile menu button */}

            <button
              type="button"
              className="a-mobile-menu"
              onClick={() => setSidebarOpen(previous => !previous)}
              aria-label="Toggle navigation"
              aria-controls="admin-navigation"
              aria-expanded={sidebarOpen}
            >
              <Icon name="menu" size={22} />
            </button>

            {/* Breadcrumb */}

            <div className="a-breadcrumb">
              <span>Admin</span>

              <Icon
                name="chevronRight"
                size={15}
              />

              <strong>{pageTitle}</strong>
            </div>

          </div>

          <div className="a-topbar-right">

            {/* Demo mode label */}

            <span className="a-demo-indicator">
              <span />
              Demo Mode
            </span>

            {/* Switch workspace */}

            <Link
              to="/"
              className="a-home-link"
            >
              Switch Workspace

              <Icon
                name="chevronRight"
                size={17}
              />
            </Link>

          </div>
        </header>

        {/* ==================================
            PAGE CONTENT
        ================================== */}

        <main className="a-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
