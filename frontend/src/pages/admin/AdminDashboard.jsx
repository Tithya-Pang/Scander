
import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import { useAdminMenu } from '../../context/AdminMenuContext';

// Sample data until the backend is connected.
const weeklyRevenue = [
  { day: 'Mon', amount: 165 },
  { day: 'Tue', amount: 218 },
  { day: 'Wed', amount: 184 },
  { day: 'Thu', amount: 286 },
  { day: 'Fri', amount: 258 },
  { day: 'Sat', amount: 345 },
  { day: 'Sun', amount: 310 }
];

const recentOrders = [
  {
    id: '#1058',
    table: 'Table 04',
    items: 3,
    amount: 21.00,
    status: 'Received'
  },
  {
    id: '#1057',
    table: 'Takeaway',
    items: 2,
    amount: 9.25,
    status: 'Received'
  },
  {
    id: '#1050',
    table: 'Table 07',
    items: 3,
    amount: 13.25,
    status: 'Preparing'
  },
  {
    id: '#1048',
    table: 'Table 12',
    items: 4,
    amount: 16.50,
    status: 'Ready'
  },
  {
    id: '#1047',
    table: 'Table 03',
    items: 2,
    amount: 8.75,
    status: 'Completed'
  }
];

const topSellingNames = [
  'Iced Latte',
  'Cappuccino',
  'Chicken Sandwich',
  'Fried Rice'
];

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

function RevenueChart() {
  const maximum = Math.max(...weeklyRevenue.map(d => d.amount));

  return (
    <div className="a-chart">
      {weeklyRevenue.map(entry => (
        <div className="a-chart-column" key={entry.day}>
          <div
            className="a-chart-bar-area"
            title={`${entry.day}: ${money(entry.amount)}`}
          >
            <div
              className={`a-chart-bar ${
                entry.day === 'Sat' ? 'a-chart-highlight' : ''
              }`}
              style={{
                height: `${(entry.amount / maximum) * 100}%`
              }}
            />
          </div>
          <span>{entry.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { items, categories } = useAdminMenu();

  const availableItems = items.filter(item => item.availability);
  const unavailableItems = items.length - availableItems.length;

  const popularItems = topSellingNames
    .map((name, index) => ({
      item: items.find(
        entry => entry.name.toLowerCase() === name.toLowerCase()
      ),
      count: [32, 25, 21, 18][index]
    }))
    .filter(entry => entry.item);

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
          Demo analytics
        </span>
      </header>

      {/* Main statistics */}
      <div className="a-metrics">
        <MetricCard
          title="Sample Revenue"
          value="$245.50"
          hint="Illustrative daily revenue"
          icon="file"
          tone="green"
        />
        <MetricCard
          title="Sample Orders"
          value="42"
          hint="Illustrative daily orders"
          icon="bag"
          tone="amber"
        />
        <MetricCard
          title="Sample Active Tables"
          value="8"
          hint="Illustrative occupancy"
          icon="grid"
          tone="blue"
        />
        <MetricCard
          title="Menu Items"
          value={items.length}
          hint={`${availableItems.length} available · ${unavailableItems} sold out`}
          icon="utensils"
          tone="purple"
        />
      </div>

      {/* Revenue chart and menu summary */}
      <div className="a-dashboard-main-grid">
        <section className="card a-dashboard-panel">
          <div className="a-dashboard-panel-header">
            <div>
              <h2>Revenue Overview</h2>
              <p>Example revenue throughout the week</p>
            </div>

            <span className="a-panel-tag">Sample · 7 days</span>
          </div>

          <div className="a-chart-summary">
            <div>
              <span className="muted">Sample weekly revenue</span>
              <strong>
                {money(
                  weeklyRevenue.reduce(
                    (sum, day) => sum + day.amount,
                    0
                  )
                )}
              </strong>
            </div>

            <span className="a-chart-legend">
              <span />
              Revenue
            </span>
          </div>

          <RevenueChart />
        </section>

        <section className="card a-dashboard-panel">
          <div className="a-dashboard-panel-header">
            <div>
              <h2>Menu Summary</h2>
              <p>Information from your Admin menu</p>
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
              <strong>{availableItems.length}</strong>
            </div>

            <div>
              <span className="a-summary-icon a-summary-amber">
                <Icon name="alert" size={22} />
              </span>
              <span>Sold out items</span>
              <strong>{unavailableItems}</strong>
            </div>

            <div>
              <span className="a-summary-icon a-summary-blue">
                <Icon name="menu" size={22} />
              </span>
              <span>Categories</span>
              <strong>{categories.length}</strong>
            </div>
          </div>

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
              <p>Sample orders for interface preview</p>
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
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.table}</td>
                    <td>{order.items}</td>
                    <td>{money(order.amount)}</td>
                    <td>
                      <span
                        className={`a-order-status a-order-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card a-dashboard-panel">
          <div className="a-dashboard-panel-header">
            <div>
              <h2>Popular Menu Items</h2>
              <p>Illustrative sales ranking</p>
            </div>
          </div>

          <div className="a-popular-list">
            {popularItems.length === 0 ? (
              <p className="muted">
                No matching sample products available.
              </p>
            ) : (
              popularItems.map(({ item, count }, index) => (
                <div className="a-popular-item" key={item.id}>
                  <span className="a-popular-rank">
                    {index + 1}
                  </span>

                  <div className="a-popular-image">
                    {item.image ? (
                      <img src={item.image} alt="" />
                    ) : (
                      <Icon name="utensils" size={19} />
                    )}
                  </div>

                  <div className="a-popular-info">
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>

                  <div className="a-popular-sales">
                    <strong>{count}</strong>
                    <span>sample sales</span>
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
