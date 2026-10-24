
import { useState } from 'react';
import StatCard from '../../components/admin/StatCard';
import PaymentDetails from '../../components/admin/PaymentDetails';

const samplePayments = [
  {
    orderId: '#1024',
    table: 'Table 04',
    date: 'Oct 24, 2026',
    method: null,
    status: 'Unpaid',
    items: [
      { name: 'Iced Latte', quantity: 1, price: 3.50 },
      { name: 'Fried Rice', quantity: 2, price: 4.50 }
    ]
  },
  {
    orderId: '#1025',
    table: 'Table 02',
    date: 'Oct 24, 2026',
    method: null,
    status: 'Unpaid',
    items: [
      { name: 'Chicken Sandwich', quantity: 1, price: 5.25 },
      { name: 'Cappuccino', quantity: 1, price: 3.75 }
    ]
  },
  {
    orderId: '#1026',
    table: 'Table 07',
    date: 'Oct 24, 2026',
    method: null,
    status: 'Unpaid',
    items: [
      { name: 'Cappuccino', quantity: 2, price: 3.75 }
    ]
  },
  {
    orderId: '#1027',
    table: 'Table 01',
    date: 'Oct 24, 2026',
    method: 'KHQR',
    status: 'Paid',
    items: [
      { name: 'Avocado Toast', quantity: 2, price: 4.75 },
      { name: 'Iced Latte', quantity: 2, price: 3.50 }
    ]
  },
  {
    orderId: '#1028',
    table: 'Table 05',
    date: 'Oct 24, 2026',
    method: 'Cash',
    status: 'Paid',
    items: [
      { name: 'Cappuccino', quantity: 1, price: 3.75 },
      { name: 'Chocolate Cake', quantity: 1, price: 4.25 }
    ]
  }
];

const money = value => `$${value.toFixed(2)}`;

function getTotal(payment) {
  return payment.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

export default function PaymentManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const paidPayments = samplePayments.filter(
    payment => payment.status === 'Paid'
  );

  const unpaidPayments = samplePayments.filter(
    payment => payment.status === 'Unpaid'
  );

  const totalCollected = paidPayments.reduce(
    (sum, payment) => sum + getTotal(payment),
    0
  );

  const outstandingAmount = unpaidPayments.reduce(
    (sum, payment) => sum + getTotal(payment),
    0
  );

  const filteredPayments = samplePayments.filter(payment => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      payment.orderId.toLowerCase().includes(query) ||
      payment.table.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      payment.status === statusFilter;

    const matchesMethod =
      methodFilter === 'All' ||
      payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <section className="admin-payments">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">FINANCIAL OVERVIEW</span>
          <h1>Payment Management</h1>
          <p className="muted">
            Monitor payment records and view receipts.
          </p>
          <p className="muted">
            Demo mode — no actual payments are processed.
          </p>
        </div>

        <span className="admin-demo-label">Demo Data</span>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Collected"
          value={money(totalCollected)}
          hint="Paid sample orders"
        />
        <StatCard
          label="Paid Orders"
          value={paidPayments.length}
          hint="Payment completed"
        />
        <StatCard
          label="Unpaid Orders"
          value={unpaidPayments.length}
          hint="Awaiting payment"
        />
        <StatCard
          label="Outstanding"
          value={money(outstandingAmount)}
          hint="Unpaid sample amounts"
        />
      </div>

      <div className="card admin-payment-list">
        <div className="admin-section-heading">
          <h2>Payment Records</h2>
          <span className="muted">
            {filteredPayments.length} records
          </span>
        </div>

        <div className="admin-menu-toolbar">
          <input
            type="search"
            placeholder="Search order or table..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            value={statusFilter}
            aria-label="Filter payment status"
            onChange={event => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <select
            value={methodFilter}
            aria-label="Filter payment method"
            onChange={event => setMethodFilter(event.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="KHQR">KHQR</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.orderId}>
                  <td><strong>{payment.orderId}</strong></td>
                  <td>{payment.table}</td>
                  <td>{payment.date}</td>
                  <td>
                    <strong>{money(getTotal(payment))}</strong>
                  </td>
                  <td>{payment.method || '—'}</td>
                  <td>
                    <span
                      className={`admin-payment-badge ${payment.status.toLowerCase()}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      {payment.status === 'Paid'
                        ? 'View Receipt'
                        : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-empty">
                    No matching payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </section>
  );
}
