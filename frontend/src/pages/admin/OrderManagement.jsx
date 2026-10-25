
import { useEffect, useState } from 'react';
import Icon from '../../components/common/Icon';

import {
  getAdminOrders,
  getAdminOrderDetails,
} from '../../services/adminOrderService';

// ==========================================
// CONSTANTS
// ==========================================

const PAGE_SIZE = 10;

const statusOptions = [
  ['all', 'All Statuses'],
  ['RECEIVED', 'Received'],
  ['PREPARING', 'Preparing'],
  ['READY', 'Ready'],
  ['SERVED', 'Served'],
  ['CANCELLED', 'Cancelled'],
];

const typeOptions = [
  ['all', 'All Order Types'],
  ['dine-in', 'Dine-in'],
  ['takeaway', 'Takeaway'],
];

const statusLabels = {
  RECEIVED: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  CANCELLED: 'Cancelled',
};

const statusTones = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'completed',
  CANCELLED: 'cancelled',
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function money(value) {
  if (value == null) return '—';

  return `$${Number(value).toFixed(2)}`;
}

function normalizeStatus(value) {
  return String(value || '').toUpperCase();
}

function formatDateTime(value) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function getOrderType(order) {
  const type = String(
    order.order_type || order.type || ''
  ).toLowerCase();

  if (type === 'takeaway') {
    return 'takeaway';
  }

  if (
    type === 'dine-in' ||
    type === 'dine_in' ||
    order.table_id != null
  ) {
    return 'dine-in';
  }

  return 'unknown';
}

function preparedCount(items) {
  return items.filter(item =>
    ['READY', 'SERVED'].includes(
      normalizeStatus(item.status)
    )
  ).length;
}

function totalDishes(items) {
  return items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
}

// ==========================================
// ORDER DETAILS POPUP
// ==========================================

function DetailsModal({ order, onClose }) {
  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const status = normalizeStatus(order.status);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'grid',
        placeItems: 'center',
        padding: 18,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-detail-title"
        className="card"
        onClick={event => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 650,
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 24,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <span className="eyebrow">
              ORDER DETAILS
            </span>

            <h2 id="admin-order-detail-title">
              {order.order_number ||
                `#${order.order_id}`}
            </h2>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* ORDER INFORMATION */}
        <div style={{ marginTop: 20 }}>
          <p>
            <strong>Status: </strong>
            {statusLabels[status] ||
              order.status ||
              'Unknown'}
          </p>

          <p>
            <strong>Table: </strong>
            {order.table_id != null
              ? `Table ID ${order.table_id}`
              : 'Not specified'}
          </p>

          <p>
            <strong>Placed At: </strong>
            {formatDateTime(order.ordered_at)}
          </p>

          <p>
            <strong>Total Amount: </strong>
            {money(order.total_amount)}
          </p>

          {order.customer_note && (
            <p>
              <strong>Customer Note: </strong>
              {order.customer_note}
            </p>
          )}
        </div>

        {/* ORDER ITEMS */}
        <div style={{ marginTop: 20 }}>
          <h3>Ordered Dishes</h3>

          {items.length === 0 ? (
            <p className="muted">
              No dishes found for this order.
            </p>
          ) : (
            items.map(item => {
              const itemStatus = normalizeStatus(
                item.status
              );

              return (
                <div
                  key={item.order_item_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 18,
                    padding: '12px 0',
                    borderBottom:
                      '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <strong>
                      {item.item_name ||
                        'Unnamed dish'}
                    </strong>

                    <div className="muted">
                      Quantity: {item.quantity}
                    </div>

                    <div className="muted">
                      Status:{' '}
                      {statusLabels[itemStatus] ||
                        item.status ||
                        'Unknown'}
                    </div>

                    {item.special_instruction && (
                      <div className="muted">
                        Note: {item.special_instruction}
                      </div>
                    )}
                  </div>

                  <strong>
                    {money(item.subtotal)}
                  </strong>
                </div>
              );
            })
          )}
        </div>

        {/* PREPARATION SUMMARY */}
        <p style={{ marginTop: 18 }}>
          <strong>Preparation: </strong>
          {preparedCount(items)} of {items.length}{' '}
          dish lines ready or served
        </p>
      </section>
    </div>
  );
}

// ==========================================
// ADMIN ORDER MANAGEMENT PAGE
// ==========================================

export default function OrderManagement() {
  // REAL ORDER DATA
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);

  // LOADING AND ERROR
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // PAGINATION
  const [page, setPage] = useState(1);

  // REFRESH TRIGGER
  const [refresh, setRefresh] = useState(0);

  // FILTERS
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('all');
  const [typeFilter, setTypeFilter] =
    useState('all');

  // ORDER DETAILS
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // ==========================================
  // LOAD ORDERS FROM BACKEND
  // ==========================================

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        // Step 1: Retrieve the list of orders.
        const result = await getAdminOrders(
          page,
          PAGE_SIZE
        );

        // Step 2: Retrieve dishes for each order.
        const detailResults = await Promise.allSettled(
          result.orders.map(order =>
            getAdminOrderDetails(order.order_id)
          )
        );

        if (ignore) return;

        // Step 3: Combine order information
        // with its individual dishes.
        const enrichedOrders = result.orders.map(
          (order, index) => {
            const detailResult = detailResults[index];

            const detailAvailable =
              detailResult.status === 'fulfilled';

            return {
              ...order,

              items: detailAvailable
                ? detailResult.value.items
                : null,

              detailAvailable,
            };
          }
        );

        setOrders(enrichedOrders);
        setPagination(result.pagination);
      } catch (err) {
        if (!ignore) {
          console.error(
            'Failed to load Admin Orders:',
            err
          );

          setOrders([]);
          setPagination(null);

          setError(
            err.message || 'Unable to load orders.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [page, refresh]);

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const counts = {
    received: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
  };

  orders.forEach(order => {
    const status = normalizeStatus(order.status);

    if (status === 'RECEIVED') {
      counts.received++;
    }

    if (status === 'PREPARING') {
      counts.preparing++;
    }

    if (status === 'READY') {
      counts.ready++;
    }

    if (status === 'SERVED') {
      counts.completed++;
    }
  });

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  // Filters apply to the currently loaded page.
  const filteredOrders = orders.filter(order => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      String(
        order.order_number || order.order_id
      )
        .toLowerCase()
        .includes(query) ||
      `table ${order.table_id ?? ''}`.includes(
        query
      ) ||
      (order.items || []).some(item =>
        String(item.item_name || '')
          .toLowerCase()
          .includes(query)
      );

    const matchesStatus =
      statusFilter === 'all' ||
      normalizeStatus(order.status) ===
        statusFilter;

    const matchesType =
      typeFilter === 'all' ||
      getOrderType(order) === typeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType
    );
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalOrders = Number(
    pagination?.total ?? 0
  );

  const totalPages = Math.max(
    1,
    Number(
      pagination?.totalPages ||
        Math.ceil(totalOrders / PAGE_SIZE) ||
        1
    )
  );

  // ==========================================
  // BUTTON FUNCTIONS
  // ==========================================

  function refreshOrders() {
    setSelectedOrder(null);
    setRefresh(previous => previous + 1);
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <section className="a-orders-page">

      {/* HEADER */}
      <header className="a-orders-heading">
        <div>
          <span className="eyebrow">
            RESTAURANT OPERATIONS
          </span>

          <h1>Order Management</h1>

          <p>
            Monitor incoming orders and follow
            kitchen preparation progress.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-small"
          disabled={loading}
          onClick={refreshOrders}
        >
          <Icon name="refresh" size={16} />
          Refresh Orders
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <div className="a-orders-stats">
        {[
          {
            label: 'Orders on Page',
            value: orders.length,
            icon: 'bag',
            tone: 'slate',
          },
          {
            label: 'Received',
            value: counts.received,
            icon: 'inbox',
            tone: 'blue',
          },
          {
            label: 'Preparing',
            value: counts.preparing,
            icon: 'flame',
            tone: 'amber',
          },
          {
            label: 'Ready to Serve',
            value: counts.ready,
            icon: 'cloche',
            tone: 'green',
          },
          {
            label: 'Completed',
            value: counts.completed,
            icon: 'checkCircle',
            tone: 'purple',
          },
        ].map(stat => (
          <article
            className={`a-orders-stat a-orders-stat-${stat.tone}`}
            key={stat.label}
          >
            <div>
              <span>{stat.label}</span>
              <Icon
                name={stat.icon}
                size={21}
              />
            </div>

            <strong>
              {loading
                ? '...'
                : error
                  ? '—'
                  : stat.value}
            </strong>
          </article>
        ))}
      </div>

      {/* ORDER TABLE */}
      <section className="card a-orders-panel">

        {/* SECTION HEADER */}
        <div className="a-orders-panel-heading">
          <div>
            <h2>All Orders</h2>

            <p>
              {loading
                ? 'Loading orders...'
                : `${filteredOrders.length} matching orders on this page`}
            </p>
          </div>

          <span className="a-orders-readonly">
            <Icon name="lock" size={15} />
            Read-only monitoring
          </span>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p
            role="alert"
            style={{ color: '#b42318' }}
          >
            {error}

            <button
              type="button"
              className="btn btn-outline btn-small"
              onClick={refreshOrders}
            >
              Try Again
            </button>
          </p>
        )}

        {/* FILTERS */}
        <div className="a-orders-filters">
          <label className="a-orders-search">
            <Icon name="search" size={19} />

            <input
              type="search"
              placeholder="Search order, table, or dish..."
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
            />
          </label>

          <select
            aria-label="Filter order status"
            value={statusFilter}
            onChange={event =>
              setStatusFilter(event.target.value)
            }
          >
            {statusOptions.map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>

          <select
            aria-label="Filter order type"
            value={typeFilter}
            onChange={event =>
              setTypeFilter(event.target.value)
            }
          >
            {typeOptions.map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            className="a-orders-reset"
            onClick={resetFilters}
            title="Reset filters"
            aria-label="Reset filters"
          >
            <Icon name="refresh" size={19} />
          </button>
        </div>

        {/* ORDER TABLE */}
        <div className="table-scroll">
          <table className="a-orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Table / Type</th>
                <th>Items</th>
                <th>Progress</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                !error &&
                filteredOrders.map(order => {
                  const items = order.items;

                  const prepared = items
                    ? preparedCount(items)
                    : 0;

                  const lines = items?.length || 0;

                  const percent = lines
                    ? (prepared / lines) * 100
                    : 0;

                  const status = normalizeStatus(
                    order.status
                  );

                  return (
                    <tr key={order.order_id}>

                      {/* ORDER NUMBER */}
                      <td>
                        <div className="a-orders-id">
                          <strong>
                            {order.order_number ||
                              `#${order.order_id}`}
                          </strong>

                          <small>
                            {formatDateTime(
                              order.ordered_at
                            )}
                          </small>
                        </div>
                      </td>

                      {/* TABLE NUMBER */}
                      <td>
                        <div className="a-orders-table-info">
                          <strong>
                            {getOrderType(order) ===
                            'takeaway'
                              ? 'Takeaway'
                              : order.table_id == null
                                ? 'Not specified'
                                : `Table ID ${order.table_id}`}
                          </strong>

                          <small>
                            {getOrderType(order) ===
                            'unknown'
                              ? 'Type not specified'
                              : getOrderType(order) ===
                                  'takeaway'
                                ? 'Pickup order'
                                : 'Dine-in'}
                          </small>
                        </div>
                      </td>

                      {/* ORDERED DISHES */}
                      <td>
                        <div className="a-orders-dishes">
                          <div className="a-orders-dish-images">
                            {(items || [])
                              .slice(0, 3)
                              .map(item => (
                                <span
                                  key={
                                    item.order_item_id
                                  }
                                >
                                  <Icon
                                    name="utensils"
                                    size={16}
                                  />
                                </span>
                              ))}
                          </div>

                          <small>
                            {items
                              ? `${totalDishes(items)} dishes`
                              : 'Items unavailable'}
                          </small>
                        </div>
                      </td>

                      {/* PREPARATION PROGRESS */}
                      <td>
                        <div className="a-orders-progress">
                          {items ? (
                            <>
                              <div
                                className="a-orders-progress-track"
                                role="progressbar"
                                aria-label={`Order ${order.order_id} preparation progress`}
                                aria-valuemin={0}
                                aria-valuemax={lines}
                                aria-valuenow={
                                  prepared
                                }
                              >
                                <span
                                  style={{
                                    width: `${percent}%`,
                                  }}
                                />
                              </div>

                              <small>
                                {prepared}/{lines} dish
                                lines ready or served
                              </small>
                            </>
                          ) : (
                            <small>
                              Progress unavailable
                            </small>
                          )}
                        </div>
                      </td>

                      {/* TOTAL AMOUNT */}
                      <td>
                        <strong className="a-orders-price">
                          {money(
                            order.total_amount
                          )}
                        </strong>
                      </td>

                      {/* ORDER STATUS */}
                      <td>
                        <span
                          className={`a-order-status a-order-${
                            statusTones[status] ||
                            'received'
                          }`}
                        >
                          {statusLabels[status] ||
                            status ||
                            'Unknown'}
                        </span>
                      </td>

                      {/* DETAILS BUTTON */}
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          disabled={
                            !order.detailAvailable
                          }
                          title={
                            !order.detailAvailable
                              ? 'Could not load order details. Refresh and try again.'
                              : undefined
                          }
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                        >
                          Details

                          <Icon
                            name="chevronRight"
                            size={15}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {/* LOADING */}
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Loading real orders and dishes...
                  </td>
                </tr>
              )}

              {/* EMPTY STATE */}
              {!loading &&
                !error &&
                filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="admin-empty"
                    >
                      No orders match your filters
                      on this page.
                    </td>
                  </tr>
                )}

              {/* ERROR STATE */}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Orders could not be loaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="a-orders-pagination">
          <span>
            Showing{' '}
            {totalOrders
              ? (page - 1) * PAGE_SIZE + 1
              : 0}
            {'–'}
            {Math.min(
              page * PAGE_SIZE,
              totalOrders
            )}{' '}
            of {totalOrders}
          </span>

          <div>
            <button
              type="button"
              disabled={loading || page === 1}
              aria-label="Previous page"
              onClick={() =>
                setPage(previous => previous - 1)
              }
            >
              <Icon
                name="chevronLeft"
                size={18}
              />
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={
                loading || page >= totalPages
              }
              aria-label="Next page"
              onClick={() =>
                setPage(previous => previous + 1)
              }
            >
              <Icon
                name="chevronRight"
                size={18}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <DetailsModal
          order={selectedOrder}
          onClose={() =>
            setSelectedOrder(null)
          }
        />
      )}
    </section>
  );
}
