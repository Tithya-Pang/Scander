
import { useState } from 'react';
import Icon from '../../components/common/Icon';
import PaymentDetails from '../../components/admin/PaymentDetails';
import {
  demoPayments,
  getDemoPaymentTotal
} from '../../data/demoPayments';
// Demo records until payment APIs are connected.

const samplePayments = demoPayments;
const getTotal = getDemoPaymentTotal;

const money = value => `$${value.toFixed(2)}`;

function PaymentStat({ label, value, hint, icon, tone }) {
  return (
    <article className={`a-payment-stat a-payment-stat-${tone}`}>
      <div className="a-payment-stat-top">
        <span>{label}</span>
        <Icon name={icon} size={22} />
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
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

  const outstanding = unpaidPayments.reduce(
    (sum, payment) => sum + getTotal(payment),
    0
  );

  const filteredPayments = samplePayments.filter(payment => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      payment.orderId.toLowerCase().includes(query) ||
      payment.table.toLowerCase().includes(query) ||
      payment.items.some(item =>
        item.name.toLowerCase().includes(query)
      );

    const matchesStatus =
      statusFilter === 'All' ||
      payment.status === statusFilter;

    const matchesMethod =
      methodFilter === 'All' ||
      (methodFilter === 'None'
        ? !payment.method
        : payment.method === methodFilter);

    return matchesSearch && matchesStatus && matchesMethod;
  });

  function resetFilters() {
    setSearch('');
    setStatusFilter('All');
    setMethodFilter('All');
  }

  return (
    <section className="a-payments-page">

      {/* Page heading */}
      <header className="a-payments-heading">
        <div>
          <span className="eyebrow">FINANCIAL OVERVIEW</span>
          <h1>Payment Management</h1>
          <p>
            Monitor payment records, transaction status, and receipts.
          </p>
        </div>

        <span className="a-payments-demo">
          <Icon name="file" size={16} />
          Demo transactions
        </span>
      </header>

      {/* Summary cards */}
      <div className="a-payment-stats">
        <PaymentStat
          label="Total Collected"
          value={money(totalCollected)}
          hint="Sample paid transactions"
          icon="checkCircle"
          tone="green"
        />

        <PaymentStat
          label="Paid Orders"
          value={paidPayments.length}
          hint="Marked paid in demo data"
          icon="check"
          tone="blue"
        />

        <PaymentStat
          label="Unpaid Orders"
          value={unpaidPayments.length}
          hint="Pending demonstration payments"
          icon="clock"
          tone="amber"
        />

        <PaymentStat
          label="Outstanding"
          value={money(outstanding)}
          hint="Sample unpaid order totals"
          icon="alert"
          tone="purple"
        />
      </div>

      {/* Payment records */}
      <section className="card a-payments-panel">
        <div className="a-payments-panel-head">
          <div>
            <h2>Payment Records</h2>
            <p>
              {filteredPayments.length} matching transactions
            </p>
          </div>

          <span className="a-payment-view-only">
            <Icon name="lock" size={15} />
            Monitoring only
          </span>
        </div>

        {/* Search and filters */}
        <div className="a-payments-filters">
          <label className="a-payments-search">
            <Icon name="search" size={19} />

            <input
              type="search"
              placeholder="Search order, table, or item..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search payments"
            />
          </label>

          <select
            value={statusFilter}
            onChange={event =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter by payment status"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <select
            value={methodFilter}
            onChange={event =>
              setMethodFilter(event.target.value)
            }
            aria-label="Filter by payment method"
          >
            <option value="All">All Methods</option>
            <option value="KHQR">KHQR</option>
            <option value="Cash">Cash</option>
            <option value="None">Not Paid</option>
          </select>

          <button
            type="button"
            className="a-payments-reset"
            onClick={resetFilters}
            title="Reset filters"
            aria-label="Reset filters"
          >
            <Icon name="refresh" size={19} />
          </button>
        </div>

        <div className="table-scroll">
          <table className="a-payments-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>TABLE</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>METHOD</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.orderId}>
                  <td>
                    <div className="a-payment-order-cell">
                      <strong>{payment.orderId}</strong>
                      <small>
                        {payment.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )} items
                      </small>
                    </div>
                  </td>

                  <td>{payment.table}</td>

                  <td className="a-payment-date">
                    {payment.date}
                  </td>

                  <td>
                    <strong className="a-payment-amount">
                      {money(getTotal(payment))}
                    </strong>
                  </td>

                  <td>
                    {payment.method ? (
                      <span
                        className={`a-payment-method a-method-${payment.method.toLowerCase()}`}
                      >
                        <Icon
                          name={payment.method === 'Cash'
                            ? 'bag'
                            : 'grid'}
                          size={15}
                        />
                        {payment.method}
                      </span>
                    ) : (
                      <span className="a-method-none">—</span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`a-payment-status a-payment-${payment.status.toLowerCase()}`}
                    >
                      <Icon
                        name={payment.status === 'Paid'
                          ? 'checkCircle'
                          : 'clock'}
                        size={15}
                      />
                      {payment.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="a-payment-details-button"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      {payment.status === 'Paid'
                        ? 'View Receipt'
                        : 'View Details'}
                      <Icon name="chevronRight" size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    <p>No payments match your filters.</p>
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="a-payments-table-footer">
          <span>
            Showing {filteredPayments.length} of{' '}
            {samplePayments.length} records
          </span>
          <span>Sample data · Oct 24, 2026</span>
        </footer>
      </section>

      {selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </section>
  );
}
