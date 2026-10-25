
import { useEffect, useState } from 'react';
import Icon from '../../components/common/Icon';
import { getAdminOrders } from '../../services/adminOrderService';

// ==========================================
// HELPERS
// ==========================================

const PAGE_SIZE = 100;

const money = value => {
  if (value == null) return '—';
  return `$${Number(value).toFixed(2)}`;
};

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ==========================================
// SUMMARY CARD
// ==========================================

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

// ==========================================
// READ-ONLY ORDER DETAILS
// ==========================================

function PaymentOrderDetails({ order, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="admin-order-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'rgba(15, 23, 42, 0.55)',
      }}
    >
      <section
        className="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-order-heading"
        onClick={event => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 24,
        }}
      >
        <span className="eyebrow">ORDER INFORMATION</span>

        <h2 id="payment-order-heading">
          {order.order_number || `#${order.order_id}`}
        </h2>

        <div style={{ marginTop: 20 }}>
          <p>
            <strong>Table: </strong>
            {order.table_id != null
              ? `Table ID ${order.table_id}`
              : 'Not specified'}
          </p>

          <p>
            <strong>Ordered At: </strong>
            {formatDate(order.ordered_at)}
          </p>

          <p>
            <strong>Order Amount: </strong>
            {money(order.total_amount)}
          </p>

          <p>
            <strong>Kitchen Status: </strong>
            {order.status || 'Unknown'}
          </p>

          <p>
            <strong>Payment Status: </strong>
            Not tracked yet
          </p>

          <p>
            <strong>Payment Method: </strong>
            Not recorded
          </p>
        </div>

        <div
          style={{
            padding: 14,
            marginTop: 20,
            borderRadius: 10,
            background: 'var(--surface, #f4f7f5)',
          }}
        >
          <strong>Payment tracking not connected</strong>

          <p style={{ marginTop: 6, fontSize: 14 }}>
            This is a real order from Supabase.
            A payment record has not been retrieved
            because the payment module is not
            implemented yet.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 20,
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// PAYMENT MANAGEMENT
// ==========================================

export default function PaymentManagement() {
  const [orders, setOrders] = useState([]);

  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  const [selectedPayment, setSelectedPayment] = useState(null);

  // ==========================================
  // GET REAL ORDERS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const result = await getAdminOrders(
          1,
          PAGE_SIZE
        );

        if (cancelled) return;

        setOrders(result.orders);
        setTotalOrders(
          Number(
            result.pagination?.total ??
            result.orders.length
          )
        );
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to load orders:', err);

        setOrders([]);
        setTotalOrders(0);

        setError(
          err.message || 'Unable to retrieve orders.'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ==========================================
  // ORDER AMOUNT SUMMARY
  // ==========================================

  // This is NOT collected revenue.
  // It only represents the value of loaded orders.
  const loadedOrderValue = orders
    .filter(order => order.status !== 'CANCELLED')
    .reduce(
      (sum, order) =>
        sum + Number(order.total_amount || 0),
      0
    );

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredOrders = orders.filter(order => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      String(order.order_number || '')
        .toLowerCase()
        .includes(query) ||
      String(order.order_id).includes(query) ||
      String(order.table_id ?? '')
        .includes(query);

    // All existing orders have an unknown payment
    // status until payment tracking is implemented.
    const matchesStatus =
      statusFilter === 'All' ||
      statusFilter === 'Not Tracked';

    const matchesMethod =
      methodFilter === 'All' ||
      methodFilter === 'Not Recorded';

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMethod
    );
  });

  // ==========================================
  // FUNCTIONS
  // ==========================================

  function resetFilters() {
    setSearch('');
    setStatusFilter('All');
    setMethodFilter('All');
  }

  function refreshOrders() {
    setSelectedPayment(null);
    setRefreshKey(previous => previous + 1);
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <section className="a-payments-page">

      {/* PAGE HEADER */}
      <header className="a-payments-heading">
        <div>
          <span className="eyebrow">
            FINANCIAL OVERVIEW
          </span>

          <h1>Payment Management</h1>

          <p>
            Review order amounts while payment tracking
            is being implemented.
          </p>
        </div>

        <span className="a-payments-demo">
          <Icon name="clock" size={16} />
          Payment tracking pending
        </span>
      </header>

      {/* SUMMARY CARDS */}
      <div className="a-payment-stats">
        <PaymentStat
          label="Order Value Loaded"
          value={
            loading
              ? '...'
              : error
                ? '—'
                : money(loadedOrderValue)
          }
          hint="Not confirmed payment revenue"
          icon="bag"
          tone="green"
        />

        <PaymentStat
          label="Paid Orders"
          value="—"
          hint="Payment records not connected"
          icon="check"
          tone="blue"
        />

        <PaymentStat
          label="Unpaid Orders"
          value="—"
          hint="Cannot determine from kitchen status"
          icon="clock"
          tone="amber"
        />

        <PaymentStat
          label="Outstanding"
          value="—"
          hint="Requires verified payment records"
          icon="alert"
          tone="purple"
        />
      </div>

      {/* PAYMENT LIST */}
      <section className="card a-payments-panel">
        <div className="a-payments-panel-head">
          <div>
            <h2>Order Payment Overview</h2>

            <p>
              {loading
                ? 'Loading real orders...'
                : `${filteredOrders.length} matching orders`}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={refreshOrders}
            disabled={loading}
          >
            <Icon name="refresh" size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <p
            role="alert"
            style={{
              color: '#b42318',
              padding: '12px 0',
            }}
          >
            {error}
          </p>
        )}

        {/* FILTERS */}
        <div className="a-payments-filters">
          <label className="a-payments-search">
            <Icon name="search" size={19} />

            <input
              type="search"
              placeholder="Search order or table..."
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              aria-label="Search orders"
            />
          </label>

          <select
            value={statusFilter}
            onChange={event =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter payment status"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Not Tracked">
              Not Tracked
            </option>
          </select>

          <select
            value={methodFilter}
            onChange={event =>
              setMethodFilter(event.target.value)
            }
            aria-label="Filter payment method"
          >
            <option value="All">
              All Methods
            </option>

            <option value="Not Recorded">
              Not Recorded
            </option>
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

        {/* TABLE */}
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
              {!loading &&
                !error &&
                filteredOrders.map(order => (
                  <tr key={order.order_id}>

                    {/* ORDER */}
                    <td>
                      <div className="a-payment-order-cell">
                        <strong>
                          {order.order_number ||
                            `#${order.order_id}`}
                        </strong>

                        <small>
                          ID: {order.order_id}
                        </small>
                      </div>
                    </td>

                    {/* TABLE */}
                    <td>
                      {order.table_id != null
                        ? `Table ID ${order.table_id}`
                        : '—'}
                    </td>

                    {/* DATE */}
                    <td className="a-payment-date">
                      {formatDate(order.ordered_at)}
                    </td>

                    {/* AMOUNT */}
                    <td>
                      <strong className="a-payment-amount">
                        {money(order.total_amount)}
                      </strong>
                    </td>

                    {/* METHOD */}
                    <td>
                      <span className="a-method-none">
                        Not recorded
                      </span>
                    </td>

                    {/* PAYMENT STATUS */}
                    <td>
                      <span
                        className="a-payment-status a-payment-unpaid"
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        <Icon
                          name="clock"
                          size={15}
                        />
                        Not Tracked
                      </span>
                    </td>

                    {/* DETAILS */}
                    <td>
                      <button
                        type="button"
                        className="a-payment-details-button"
                        onClick={() =>
                          setSelectedPayment(order)
                        }
                      >
                        View Details

                        <Icon
                          name="chevronRight"
                          size={15}
                        />
                      </button>
                    </td>
                  </tr>
                ))}

              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Loading real orders...
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="admin-empty"
                    >
                      No matching orders found.
                    </td>
                  </tr>
                )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Could not load order records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <footer className="a-payments-table-footer">
          <span>
            Showing {filteredOrders.length} of{' '}
            {totalOrders} orders
          </span>

          <span>
            {totalOrders > PAGE_SIZE
              ? `Showing latest ${PAGE_SIZE} only`
              : 'Real order data · Payment tracking pending'}
          </span>
        </footer>
      </section>

      {/* DETAILS POPUP */}
      {selectedPayment && (
        <PaymentOrderDetails
          order={selectedPayment}
          onClose={() =>
            setSelectedPayment(null)
          }
        />
      )}
    </section>
  );
}
