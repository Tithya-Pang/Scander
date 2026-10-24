// import StatCard from '../../components/admin/StatCard';
// export default function AdminDashboard(){return <section><span className="eyebrow">OVERVIEW</span><h1>Admin Dashboard</h1><p className="muted">Example numbers only, not live restaurant analytics.</p><div className="stats-grid"><StatCard label="Orders today" value="42" hint="Sample data"/><StatCard label="Active tables" value="8" hint="Sample data"/><StatCard label="Menu items" value="24" hint="Sample data"/></div><div className="card"><h2>Welcome to Scander</h2><p className="muted">Menu, order, table and reporting pages are ready to build.</p></div></section>}


import StatCard from '../../components/admin/StatCard';

const recentOrders = [
  { id: '#1001', table: 'Table 01', amount: 12.50, status: 'Completed' },
  { id: '#1002', table: 'Table 03', amount: 8.75, status: 'Preparing' },
  { id: '#1003', table: 'Table 05', amount: 16.00, status: 'Pending' },
];

export default function AdminDashboard() {
  return (
    <section className="admin-dashboard">

      <div className="admin-heading">
        <div>
          <span className="eyebrow">RESTAURANT OVERVIEW</span>
          <h1>Dashboard Overview</h1>
          <p className="muted">
            Monitor your restaurant's daily activity.
          </p>
        </div>
        <span className="admin-demo-label">Demo Data</span>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Today's Revenue"
          value="$245.50"
          hint="Example revenue"
        />
        <StatCard
          label="Total Orders"
          value="42"
          hint="Orders today"
        />
        <StatCard
          label="Active Tables"
          value="8"
          hint="Currently occupied"
        />
        <StatCard
          label="Menu Items"
          value="96"
          hint="Sample restaurant catalog"
        />
      </div>

      <div className="card admin-recent-orders">
        <div className="admin-section-heading">
          <h2>Recent Orders</h2>
          <span className="muted">Latest activity</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.table}</td>
                  <td>${order.amount.toFixed(2)}</td>
                  <td>
                    <span className={`admin-order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
