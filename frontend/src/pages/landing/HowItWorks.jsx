
import { Link } from "react-router-dom";
import "../../styles/guide.css";

const customerSteps = [
  {
    number: "01",
    icon: "▦",
    title: "Scan QR",
    description:
      "Scan the QR code at your table to open the digital menu.",
  },
  {
    number: "02",
    icon: "☰",
    title: "Browse Menu",
    description:
      "Explore dishes, view prices, and choose your favorites.",
  },
  {
    number: "03",
    icon: "＋",
    title: "Place Order",
    description:
      "Add items to your cart and submit your order.",
  },
  {
    number: "04",
    icon: "✓",
    title: "Enjoy",
    description:
      "Our kitchen prepares your food for staff to serve.",
  },
];

const adminFeatures = [
  {
    icon: "▣",
    title: "Dashboard Overview",
    description:
      "Monitor orders, revenue, and restaurant activity.",
  },
  {
    icon: "☷",
    title: "Menu & Categories",
    description:
      "Manage dishes, prices, categories, and availability.",
  },
  {
    icon: "▤",
    title: "Order Management",
    description:
      "View customer orders and track their status.",
  },
  {
    icon: "▦",
    title: "Table Management",
    description:
      "Organize restaurant tables and QR codes.",
  },
  {
    icon: "▣",
    title: "Payments",
    description:
      "Access payment information and records.",
  },
  {
    icon: "▥",
    title: "Sales Reports",
    description:
      "Review sales data and restaurant performance.",
  },
];

const kitchenSteps = [
  {
    number: "01",
    title: "Received",
    description:
      "New customer orders appear in the kitchen queue.",
    status: "received",
  },
  {
    number: "02",
    title: "Preparing",
    description:
      "Accept orders and prepare each requested dish.",
    status: "preparing",
  },
  {
    number: "03",
    title: "Ready",
    description:
      "When every dish is ready, the order moves to Ready to Serve.",
    status: "ready",
  },
  {
    number: "04",
    title: "Served",
    description:
      "Mark dishes as served. Completed orders move to History.",
    status: "served",
  },
];

export default function HowItWorks() {
  return (
    <main className="gg-guide">
      {/* INTRODUCTION */}
      <section className="gg-guide-hero">
        <div className="gg-container">
          <span className="gg-guide-kicker">
            GATHER GROUNDS / GUIDE
          </span>

          <h1>
            How Scander
            <br />
            <em>works.</em>
          </h1>

          <p>
            From ordering your favorite meal to
            managing restaurant operations, Scander
            brings everything together.
          </p>

          <div className="gg-guide-shortcuts">
            <a href="#customers" className="gg-guide-shortcut">
              <span>01</span>
              Customer Guide
              <span aria-hidden="true">↗</span>
            </a>

            <a href="#staff" className="gg-guide-shortcut">
              <span>02</span>
              Staff Guide
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* CUSTOMER GUIDE */}
      <section id="customers" className="gg-guide-customers">
        <div className="gg-container">
          <div className="gg-guide-section-heading">
            <div>
              <span className="gg-guide-kicker">
                01 / CUSTOMER EXPERIENCE
              </span>

              <h2>
                Your table.
                <br />
                <em>Your order.</em>
              </h2>
            </div>

            <p>
              No account or app download required.
              Browse the menu online, or scan your
              table's QR code to order when dining in.
            </p>
          </div>

          <div className="gg-guide-steps">
            {customerSteps.map((step) => (
              <article
                className="gg-guide-step-card"
                key={step.number}
              >
                <div className="gg-guide-step-top">
                  <span className="gg-guide-step-icon">
                    {step.icon}
                  </span>

                  <span className="gg-guide-step-number">
                    {step.number}
                  </span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>

          <div className="gg-guide-info-banner">
            <div>
              <strong>Planning your visit?</strong>
              <p>
                You can explore our menu before
                arriving. To place a dine-in order,
                scan the QR code at your table.
              </p>
            </div>

            <Link to="/menu" className="gg-guide-outline-btn">
              Explore Menu
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STAFF GUIDE */}
      <section id="staff" className="gg-guide-staff">
        <div className="gg-container">
          <div className="gg-guide-section-heading">
            <div>
              <span className="gg-guide-kicker">
                02 / STAFF OPERATIONS
              </span>

              <h2>
                Behind every
                <br />
                <em>great service.</em>
              </h2>
            </div>

            <p>
              Scander provides separate workspaces
              for restaurant administrators and
              kitchen staff.
            </p>
          </div>

          {/* ADMIN */}
          <div className="gg-guide-role">
            <div className="gg-guide-role-heading">
              <div className="gg-guide-role-icon">
                A
              </div>

              <div>
                <span className="gg-guide-role-label">
                  MANAGEMENT WORKSPACE
                </span>
                <h3>Administrator</h3>
                <p>
                  Manage restaurant operations
                  from one dashboard.
                </p>
              </div>
            </div>

            <div className="gg-guide-admin-grid">
              {adminFeatures.map((feature) => (
                <article
                  className="gg-guide-admin-card"
                  key={feature.title}
                >
                  <span>{feature.icon}</span>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>

          {/* KITCHEN */}
          <div className="gg-guide-role gg-guide-kitchen">
            <div className="gg-guide-role-heading">
              <div className="gg-guide-role-icon">
                K
              </div>

              <div>
                <span className="gg-guide-role-label">
                  KITCHEN WORKSPACE
                </span>
                <h3>Kitchen Staff</h3>
                <p>
                  Track each order from arrival
                  to completion.
                </p>
              </div>
            </div>

            <div className="gg-guide-kitchen-grid">
              {kitchenSteps.map((step) => (
                <article
                  className="gg-guide-kitchen-card"
                  key={step.number}
                >
                  <div
                    className={`gg-guide-status ${step.status}`}
                  >
                    <span className="gg-guide-status-dot" />
                    {step.title}
                  </div>

                  <span className="gg-guide-kitchen-number">
                    STEP {step.number}
                  </span>

                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="gg-guide-staff-note">
            <span className="gg-guide-note-icon">ⓘ</span>

            <p>
              Staff sign in with their assigned accounts.
              Scander directs administrators to the Admin
              Dashboard and kitchen staff to the Kitchen
              Workspace.
            </p>
          </div>
        </div>
      </section>

      {/* CONNECTED SYSTEM */}
      <section className="gg-guide-connected">
        <div className="gg-container">
          <div className="gg-guide-connected-inner">
            <span className="gg-guide-kicker">
              ONE CONNECTED SYSTEM
            </span>

            <h2>
              Everyone connected.
              <br />
              <em>Every order organized.</em>
            </h2>

            <div className="gg-guide-flow">
              <div>
                <span>01</span>
                <strong>Customer</strong>
                <small>Places order</small>
              </div>

              <span className="gg-guide-flow-arrow">→</span>

              <div>
                <span>02</span>
                <strong>Kitchen</strong>
                <small>Prepares dishes</small>
              </div>

              <span className="gg-guide-flow-arrow">→</span>

              <div>
                <span>03</span>
                <strong>Service</strong>
                <small>Serves the order</small>
              </div>
            </div>

            <p>
              Scander connects customer ordering and
              kitchen operations, helping Gather Grounds
              deliver a smoother dining experience.
            </p>
          </div>
        </div>
      </section>

      {/* STAFF LOGIN */}
      <section className="gg-guide-cta">
        <div className="gg-container">
          <div className="gg-guide-cta-panel">
            <div>
              <span>FOR GATHER GROUNDS STAFF</span>

              <h2>Ready for your shift?</h2>

              <p>
                Sign in to access your assigned workspace.
              </p>
            </div>

            <Link to="/login">
              Staff Login
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

