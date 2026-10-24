
import { useState } from 'react';
import Icon from '../../components/common/Icon';
import OrderDetails from '../../components/admin/OrderDetails';

import {
  createSeedOrders,
  getOrderStage,
  dishCount,
  orderTotals,
  formatClock,
  formatDate
} from '../../data/kitchenOrders';

const PAGE_SIZE = 10;

const statusOptions = [
  ['all', 'All Statuses'],
  ['received', 'Received'],
  ['preparing', 'Preparing'],
  ['ready', 'Ready'],
  ['completed', 'Completed']
];

const typeOptions = [
  ['all', 'All Order Types'],
  ['dine-in', 'Dine-in'],
  ['takeaway', 'Takeaway']
];

const statusLabels = {
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed'
};

const money = value => `$${value.toFixed(2)}`;

export default function OrderManagement() {
  // A snapshot of sample kitchen orders for the Admin demo.
  const [orders] = useState(() => createSeedOrders());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);

  const counts = {
    received: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  };

  orders.forEach(order => {
    counts[getOrderStage(order)]++;
  });

  const filteredOrders = orders
    .filter(order => {
      const query = search.trim().toLowerCase();
      const status = getOrderStage(order);

      const matchesSearch =
        !query ||
        String(order.id).includes(query.replace(/^#/, '')) ||
        `table ${order.table}`.includes(query) ||
        order.items.some(item =>
          item.name.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === 'all' || status === statusFilter;

      const matchesType =
        typeFilter === 'all' || order.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => b.receivedAt - a.receivedAt);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function updateStatus(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function updateType(value) {
    setTypeFilter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(1);
  }

  return (
    <section className="a-orders-page">
      <header className="a-orders-heading">
        <div>
          <span className="eyebrow">RESTAURANT OPERATIONS</span>
          <h1>Order Management</h1>
          <p>
            Monitor incoming orders and follow kitchen preparation progress.
          </p>
        </div>

        <span className="a-orders-demo">
          <Icon name="clock" size={16} />
          Demo snapshot
        </span>
      </header>

      <div className="a-orders-stats">
        {[
          {
            label: 'Total Orders',
            value: orders.length,
            icon: 'bag',
            tone: 'slate'
          },
          {
            label: 'Received',
            value: counts.received,
            icon: 'inbox',
            tone: 'blue'
          },
          {
            label: 'Preparing',
            value: counts.preparing,
            icon: 'flame',
            tone: 'amber'
          },
          {
            label: 'Ready to Serve',
            value: counts.ready,
            icon: 'cloche',
            tone: 'green'
          },
          {
            label: 'Completed',
            value: counts.completed,
            icon: 'checkCircle',
            tone: 'purple'
          }
        ].map(stat => (
          <article
            className={`a-orders-stat a-orders-stat-${stat.tone}`}
            key={stat.label}
          >
            <div>
              <span>{stat.label}</span>
              <Icon name={stat.icon} size={21} />
            </div>

            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      <section className="card a-orders-panel">
        <div className="a-orders-panel-heading">
          <div>
            <h2>All Orders</h2>
            <p>
              {filteredOrders.length} matching orders
            </p>
          </div>
          <span className="a-orders-readonly">
            <Icon name="lock" size={15} />
            Read-only monitoring
          </span>
        </div>

        <div className="a-orders-filters">
          <label className="a-orders-search">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Search order, table, or dish..."
              value={search}
              onChange={event =>
                updateSearch(event.target.value)
              }
            />
          </label>

          <select
            value={statusFilter}
            onChange={event =>
              updateStatus(event.target.value)
            }
            aria-label="Filter order status"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={event =>
              updateType(event.target.value)
            }
            aria-label="Filter order type"
          >
            {typeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
              {visibleOrders.map(order => {
                const stage = getOrderStage(order);

                const prepared = order.items.filter(item =>
                  ['ready', 'served'].includes(item.status)
                ).length;

                const totalLines = order.items.length;
                const percent = totalLines
                  ? (prepared / totalLines) * 100
                  : 0;

                return (
                  <tr key={order.id}>
                    <td>
                      <div className="a-orders-id">
                        <strong>#{order.id}</strong>
                        <small>
                          {formatDate(order.receivedAt)}
                          {' · '}
                          {formatClock(order.receivedAt)}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="a-orders-table-info">
                        <strong>
                          {order.type === 'takeaway'
                            ? 'Takeaway'
                            : `Table ${order.table}`}
                        </strong>
                        <small>
                          {order.type === 'takeaway'
                            ? 'Pickup order'
                            : 'Dine-in'}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="a-orders-dishes">
                        <div className="a-orders-dish-images">
                          {order.items.slice(0, 3).map(item => (
                            <span key={item.lineId}>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  loading="lazy"
                                />
                              ) : (
                                <Icon name="utensils" size={16} />
                              )}
                            </span>
                          ))}
                        </div>

                        <small>
                          {dishCount(order)} dishes
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="a-orders-progress">
                        <div
                          className="a-orders-progress-track"
                          role="progressbar"
                          aria-label={`Order ${order.id} preparation progress`}
                          aria-valuemin={0}
                          aria-valuemax={totalLines}
                          aria-valuenow={prepared}
                        >
                          <span
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <small>
                          {prepared}/{totalLines} dish lines ready or served
                        </small>
                      </div>
                    </td>

                    <td>
                      <strong className="a-orders-price">
                        {money(orderTotals(order).total)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`a-order-status a-order-${stage}`}
                      >
                        {statusLabels[stage]}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-small"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Details
                        <Icon name="chevronRight" size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {visibleOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="a-orders-pagination">
          <span>
            Showing {filteredOrders.length
              ? (currentPage - 1) * PAGE_SIZE + 1
              : 0}
            {' – '}
            {Math.min(
              currentPage * PAGE_SIZE,
              filteredOrders.length
            )} of {filteredOrders.length}
          </span>

          <div>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <Icon name="chevronLeft" size={18} />
            </button>

            <span>
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
            >
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
        </div>
      </section>

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}
