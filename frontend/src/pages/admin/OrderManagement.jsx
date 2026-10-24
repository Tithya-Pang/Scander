
import { useState } from 'react';
import StatCard from '../../components/admin/StatCard';
import OrderDetails from '../../components/admin/OrderDetails';
import StatusBadge from '../../components/common/StatusBadge';

const sampleOrders = [
  {
    id: '#1024',
    table: 'Table 04',
    time: '10:35 AM',
    status: 'Received',
    paymentStatus: 'Unpaid',
    instructions: 'Less ice in the latte',
    items: [
      { name: 'Iced Latte', quantity: 1, price: 3.50 },
      { name: 'Fried Rice', quantity: 2, price: 4.50 }
    ]
  },
  {
    id: '#1025',
    table: 'Table 02',
    time: '10:40 AM',
    status: 'Preparing',
    paymentStatus: 'Unpaid',
    instructions: 'No onions',
    items: [
      { name: 'Chicken Sandwich', quantity: 1, price: 5.25 },
      { name: 'Cappuccino', quantity: 1, price: 3.75 }
    ]
  },
  {
    id: '#1026',
    table: 'Table 07',
    time: '10:45 AM',
    status: 'Ready',
    paymentStatus: 'Unpaid',
    instructions: '',
    items: [
      { name: 'Cappuccino', quantity: 2, price: 3.75 }
    ]
  },
  {
    id: '#1027',
    table: 'Table 01',
    time: '09:50 AM',
    status: 'Served',
    paymentStatus: 'Paid',
    instructions: '',
    items: [
      { name: 'Avocado Toast', quantity: 2, price: 4.75 },
      { name: 'Iced Latte', quantity: 2, price: 3.50 }
    ]
  },
  {
    id: '#1028',
    table: 'Table 05',
    time: '09:30 AM',
    status: 'Served',
    paymentStatus: 'Paid',
    instructions: 'Extra hot',
    items: [
      { name: 'Cappuccino', quantity: 1, price: 3.75 },
      { name: 'Chocolate Cake', quantity: 1, price: 4.25 }
    ]
  }
];

const statuses = ['All', 'Received', 'Preparing', 'Ready', 'Served'];

function getOrderTotal(order) {
  return order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

export default function OrderManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = sampleOrders.filter(order => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(query) ||
      order.table.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const receivedCount = sampleOrders.filter(
    order => order.status === 'Received'
  ).length;

  const preparingCount = sampleOrders.filter(
    order => order.status === 'Preparing'
  ).length;

  const servedCount = sampleOrders.filter(
    order => order.status === 'Served'
  ).length;

  return (
    <section className="admin-orders">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">ORDER MONITORING</span>
          <h1>Order Management</h1>
          <p className="muted">
            Monitor restaurant orders and their preparation status.
          </p>
          <p className="muted">
            Demo mode — these are example orders, not live data.
          </p>
        </div>

        <span className="admin-demo-label">Demo Data</span>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Orders"
          value={sampleOrders.length}
          hint="Example orders"
        />

        <StatCard
          label="Received"
          value={receivedCount}
          hint="Waiting for preparation"
        />

        <StatCard
          label="Preparing"
          value={preparingCount}
          hint="Currently in the kitchen"
        />

        <StatCard
          label="Served"
          value={servedCount}
          hint="Orders delivered"
        />
      </div>

      <div className="card">
        <div className="admin-section-heading">
          <h2>All Orders</h2>
          <span className="muted">
            {filteredOrders.length} orders found
          </span>
        </div>

        <div className="admin-menu-toolbar">
          <input
            type="search"
            placeholder="Search order number or table..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            aria-label="Filter orders by status"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Time</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(order => {
                const itemCount = order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                );

                return (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.table}</td>
                    <td>{order.time}</td>
                    <td>{itemCount}</td>
                    <td>${getOrderTotal(order).toFixed(2)}</td>

                    <td>
                      <StatusBadge status={order.status} />
                    </td>

                    <td>
                      <span
                        className={`admin-payment-badge ${
                          order.paymentStatus.toLowerCase()
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-small"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetails
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </section>
  );
}
