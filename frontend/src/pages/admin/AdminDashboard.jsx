
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '../../components/common/Icon';
import { fetchMenuSummary } from '../../services/adminMenuSummaryService';
import {
  fetchDashboardStats,
  fetchDashboardAnalytics,
  fetchPopularDishes,
  fetchRecentOrders,
} from '../../services/adminDashboardService';

const money = value => `$${value.toFixed(2)}`;

function MetricCard({ title, value, hint, icon, tone }) {
  return (
    <article className={`a-metric a-metric-${tone}`}>
      <div className="a-metric-top">
        <span>{title}</span>
        <span className="a-metric-icon">
          <Icon name={icon} size={22} />
        </span>
      </div>

      <strong className="a-metric-value">{value}</strong>
      <span className="a-metric-hint">{hint}</span>
    </article>
  );
}


function OrdersChart({ data = [] }) {
  const maximum = Math.max(
    1,
    ...data.map(day => day.orders)
  );

  return (
    <div className="a-chart">
      {data.map((entry, index) => {
        const day = new Date(
          `${entry.date}T12:00:00`
        ).toLocaleDateString('en-US', {
          weekday: 'short'
        });

        const height = (entry.orders / maximum) * 100;

        return (
          <div
            className="a-chart-column"
            key={entry.date}
          >
            <div
              className="a-chart-bar-area"
              title={`${entry.date}: ${entry.orders} orders`}
            >
              <div
                className={`a-chart-bar ${
                  index === data.length - 1
                    ? 'a-chart-highlight'
                    : ''
                }`}
                style={{
                  height: `${height}%`
                }}
              />
            </div>

            <span>{day}</span>
          </div>
        );
      })}
    </div>
  );
}


export default function AdminDashboard() {

  // Real statistics from the backend.
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  const [popularDishes, setPopularDishes] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [popularError, setPopularError] = useState('');

  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const [menuSummary, setMenuSummary] = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const data = await fetchDashboardStats();

        if (!cancelled) {
          setStats(data);
          setError('');
        }
      } catch (err) {
        console.error('Dashboard stats error:', err);

        if (!cancelled) {
          setError('Unable to load dashboard statistics.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);
  
  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        const data = await fetchDashboardAnalytics();

        if (!cancelled) {
          setAnalytics(data);
          setAnalyticsError('');
        }
      } catch (err) {
        console.error('Dashboard analytics error:', err);

        if (!cancelled) {
          setAnalyticsError('Unable to load order analytics.');
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    let cancelled = false;

    async function loadPopularDishes() {
      try {
        const data = await fetchPopularDishes();

        if (!cancelled) {
          setPopularDishes(data);
          setPopularError('');
        }
      } catch (err) {
        console.error('Popular dishes error:', err);

        if (!cancelled) {
          setPopularError('Unable to load popular dishes.');
        }
      } finally {
        if (!cancelled) {
          setPopularLoading(false);
        }
      }
    }

    loadPopularDishes();

    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    let cancelled = false;

    async function loadRecentOrders() {
      try {
        const data = await fetchRecentOrders();

        if (!cancelled) {
          setRecentOrders(
            Array.isArray(data) ? data.slice(0, 5) : []
          );
          setOrdersError('');
        }
      } catch (err) {
        console.error('Recent orders error:', err);

        if (!cancelled) {
          setOrdersError('Unable to load recent orders.');
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    }

    loadRecentOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    let cancelled = false;

    async function loadMenuSummary() {
      try {
        const data = await fetchMenuSummary();

        if (!cancelled) {
          setMenuSummary(data);
          setMenuError('');
        }
      } catch (err) {
        console.error('Menu summary error:', err);

        if (!cancelled) {
          setMenuError('Unable to load menu summary.');
        }
      } finally {
        if (!cancelled) {
          setMenuLoading(false);
        }
      }
    }

    loadMenuSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="a-dashboard">
      {/* Heading */}
      <header className="a-dashboard-heading">
        <div>
          <span className="eyebrow">RESTAURANT OVERVIEW</span>
          <h1>Dashboard Overview</h1>
          <p className="muted">
            An overview of your restaurant's operations and performance.
          </p>
        </div>

        <span className="a-dashboard-demo">
            <Icon name="clock" size={16} />
            Live order statistics · Other sections in preview
        </span>
      </header>

      {error && (
        <p role="alert" className="muted">
          {error}
        </p>
      )}
      
      {/* Main statistics */}
      <div className="a-metrics">
        <MetricCard
          title="Today's Order Value"
          value={
            loading
              ? '...'
              : stats
                ? money(Number(stats.today_order_value ?? 0))
                : '—'
          }
          hint="Non-cancelled orders today"
          icon="file"
          tone="green"
        />

        <MetricCard
          title="Today's Orders"
          value={loading ? '...' : stats?.orders_today ?? '—'}
          hint={
            stats
              ? `${stats.total_orders} total orders`
              : 'Orders placed today'
          }
          icon="bag"
          tone="amber"
        />

        <MetricCard
          title="Preparing Orders"
          value={
            loading
              ? '...'
              : stats?.preparing_orders_today ?? '—'
          }
          hint="Orders placed today still preparing"
          icon="grid"
          tone="blue"
        />

        <MetricCard
          title="Menu Items"
          value={menuLoading ? '...' : menuSummary?.totalItems ?? '—'}
          hint={
            menuSummary
              ? `${menuSummary.availableItems} available · ${menuSummary.soldOutItems} sold out`
              : 'Menu inventory'
          }
          icon="utensils"
          tone="purple"
        />
      </div>


      {/* Revenue chart and menu summary */}
      <div className="a-dashboard-main-grid">
        <section className="card a-dashboard-panel">
          <div className="a-dashboard-panel-header">
            <div>
              <h2>Orders Overview</h2>
              <p>Orders placed during the last 7 days</p>
            </div>

            <span className="a-panel-tag">Last 7 days</span>
          </div>

          <div className="a-chart-summary">
            <div>
              <span className="muted">Orders this week</span>
              <strong>
                {analyticsLoading
                  ? '...'
                  : analytics
                    ? analytics.total_orders
                    : '—'}
              </strong>
            </div>

            <span className="a-chart-legend">
              <span />
              Orders
            </span>
          </div>

          {analyticsLoading ? (
            <p className="muted">Loading order trends...</p>
          ) : analyticsError ? (
            <p role="alert" className="muted">
              {analyticsError}
            </p>
          ) : (
            <OrdersChart data={analytics?.order_trend ?? []} />
          )}
        </section>


        <section className="card a-dashboard-panel">
          <div className="a-dashboard-panel-header">
            <div>
              <h2>Menu Summary</h2>
              <p>Current menu availability and categories</p>
            </div>

            <span className="a-panel-icon">
              <Icon name="utensils" size={22} />
            </span>
          </div>

          
          <div className="a-menu-summary">
            <div>
              <span className="a-summary-icon a-summary-green">
                <Icon name="checkCircle" size={22} />
              </span>
              <span>Available items</span>
              <strong>
                {menuLoading ? '...' : menuSummary?.availableItems ?? '—'}
              </strong>
            </div>

            <div>
              <span className="a-summary-icon a-summary-amber">
                <Icon name="alert" size={22} />
              </span>
              <span>Sold out items</span>
              <strong>
                {menuLoading ? '...' : menuSummary?.soldOutItems ?? '—'}
              </strong>
            </div>

            <div>
              <span className="a-summary-icon a-summary-blue">
                <Icon name="menu" size={22} />
              </span>
              <span>Categories</span>
              <strong>
                {menuLoading ? '...' : menuSummary?.totalCategories ?? '—'}
              </strong>
            </div>
          </div>

          {menuError && (
            <p role="alert" className="muted">
              {menuError}
            </p>
          )}
          
          <Link to="/admin/menu" className="a-panel-link">
            Manage Menu
            <Icon name="chevronRight" size={17} />
          </Link>
        </section>
      </div>

      {/* Orders and popular products */}
      <div className="a-dashboard-lower-grid">
        <section className="card a-dashboard-panel">
          <div className="a-dashboard-panel-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest customer orders</p>
            </div>

            <Link to="/admin/orders" className="a-text-link">
              View All
              <Icon name="chevronRight" size={16} />
            </Link>
          </div>

          <div className="table-scroll">
            <table className="a-dashboard-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td colSpan={5}>Loading recent orders...</td>
                  </tr>
                ) : ordersError ? (
                  <tr>
                    <td colSpan={5} role="alert">{ordersError}</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No orders found.</td>
                  </tr>
                ) : (
                  recentOrders.map(order => {
                    const status = order.status || 'UNKNOWN';

                    const statusLabel = status
                      .toLowerCase()
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, char => char.toUpperCase());

                    return (
                      <tr key={order.order_id}>
                        <td>
                          <strong>{order.order_number}</strong>
                        </td>

                        <td>
                          {order.table_id != null
                            ? `Table ID ${order.table_id}`
                            : '—'}
                        </td>

                        <td>—</td>

                        <td>
                          {money(Number(order.total_amount ?? 0))}
                        </td>

                        <td>
                          <span
                            className={`a-order-status a-order-${status.toLowerCase()}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>
        </section>

        <section className="card a-dashboard-panel">
          <div className="a-dashboard-panel-header">
            <div>
              <h2>Popular Menu Items</h2>
              <p>Most ordered dishes in the last 7 days</p>
            </div>
          </div>

          
          <div className="a-popular-list">
            {popularLoading ? (
              <p className="muted">Loading popular dishes...</p>
            ) : popularError ? (
              <p role="alert" className="muted">
                {popularError}
              </p>
            ) : popularDishes.length === 0 ? (
              <p className="muted">
                No popular dishes recorded in the last 7 days.
              </p>
            ) : (
              popularDishes.map((dish, index) => (
                <div
                  className="a-popular-item"
                  key={dish.item_id}
                >
                  <span className="a-popular-rank">
                    {index + 1}
                  </span>

                  <div className="a-popular-image">
                    <Icon name="utensils" size={19} />
                  </div>

                  <div className="a-popular-info">
                    <strong>{dish.name}</strong>
                    <span>
                      {dish.order_count} orders
                    </span>
                  </div>

                  <div className="a-popular-sales">
                    <strong>{dish.quantity_sold}</strong>
                    <span>items ordered</span>
                  </div>
                </div>
              ))
            )}
          </div>


          <Link to="/admin/reports" className="a-panel-link">
            View Sales Reports
            <Icon name="chevronRight" size={17} />
          </Link>
        </section>
      </div>

      {/* Quick navigation */}
      <section className="a-quick-actions">
        <div>
          <h2>Quick Actions</h2>
          <p>Jump to common restaurant management tasks.</p>
        </div>

        <div className="a-quick-grid">
          <Link to="/admin/menu" className="a-quick-action">
            <Icon name="utensils" size={21} />
            <span>Manage Menu</span>
            <Icon name="chevronRight" size={16} />
          </Link>

          <Link to="/admin/categories" className="a-quick-action">
            <Icon name="menu" size={21} />
            <span>Categories</span>
            <Icon name="chevronRight" size={16} />
          </Link>

          <Link to="/admin/tables" className="a-quick-action">
            <Icon name="grid" size={21} />
            <span>Manage Tables</span>
            <Icon name="chevronRight" size={16} />
          </Link>

          <Link to="/admin/payments" className="a-quick-action">
            <Icon name="file" size={21} />
            <span>Payments</span>
            <Icon name="chevronRight" size={16} />
          </Link>
        </div>
      </section>
    </section>
  );
}
