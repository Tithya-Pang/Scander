
import { useEffect } from 'react';
import Icon from '../common/Icon';
import {
  getOrderStage,
  orderTotals,
  formatDate,
  formatClock,
  dishCount
} from '../../data/kitchenOrders';

const labels = {
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed'
};

const money = value => `$${value.toFixed(2)}`;

export default function OrderDetails({ order, onClose }) {
  useEffect(() => {
    if (!order) return;

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener(
      'keydown',
      onKeyDown
    );
  }, [order, onClose]);

  if (!order) return null;

  const stage = getOrderStage(order);
  const totals = orderTotals(order);

  const prepared = order.items.filter(item =>
    ['ready', 'served'].includes(item.status)
  ).length;

  const progress = order.items.length
    ? (prepared / order.items.length) * 100
    : 0;

  return (
    <div
      className="admin-order-overlay"
      onClick={onClose}
    >
      <div
        className="card admin-order-dialog a-order-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        onClick={event => event.stopPropagation()}
      >
        <header className="a-order-detail-header">
          <div>
            <span className="eyebrow">ORDER DETAILS</span>
            <h2 id="order-detail-title">
              Order #{order.id}
            </h2>
            <p>
              {formatDate(order.receivedAt)}
              {' · '}
              {formatClock(order.receivedAt)}
            </p>
          </div>

          <button
            type="button"
            className="admin-dialog-close"
            onClick={onClose}
            aria-label="Close order details"
          >
            ×
          </button>
        </header>

        <div className="a-order-detail-meta">
          <div>
            <small>ORDER TYPE</small>
            <strong>
              {order.type === 'takeaway'
                ? 'Takeaway'
                : 'Dine-in'}
            </strong>
          </div>

          <div>
            <small>TABLE</small>
            <strong>
              {order.type === 'takeaway'
                ? '—'
                : `Table ${order.table}`}
            </strong>
          </div>

          <div>
            <small>STATUS</small>
            <span className={`a-order-status a-order-${stage}`}>
              {labels[stage]}
            </span>
          </div>
        </div>

        <section className="a-order-detail-progress">
          <div>
            <strong>Preparation Progress</strong>
            <span>{prepared} of {order.items.length} dish lines</span>
          </div>

          <div
            className="a-orders-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={order.items.length}
            aria-valuenow={prepared}
            aria-label="Preparation progress"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>

        <h3 className="a-order-detail-section">
          Ordered Dishes
        </h3>

        <div className="a-order-detail-items">
          {order.items.map(item => (
            <div className="a-order-detail-item" key={item.lineId}>
              <div className="a-order-detail-thumbnail">
                {item.image ? (
                  <img src={item.image} alt="" />
                ) : (
                  <Icon name="utensils" size={22} />
                )}
              </div>

              <div className="a-order-detail-item-info">
                <strong>{item.qty}× {item.name}</strong>

                {item.note && <small>Note: {item.note}</small>}

                <span
                  className={`a-dish-status a-dish-${item.status}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="a-order-detail-item-price">
                <strong>{money(item.price * item.qty)}</strong>
                <small>{money(item.price)} each</small>
              </div>
            </div>
          ))}
        </div>

        <div className="a-order-detail-totals">
          <div>
            <span>Subtotal ({dishCount(order)} items)</span>
            <strong>{money(totals.subtotal)}</strong>
          </div>

          <div>
            <span>Estimated Tax (8%)</span>
            <strong>{money(totals.tax)}</strong>
          </div>

          <div className="a-order-detail-grand">
            <span>Total</span>
            <strong>{money(totals.total)}</strong>
          </div>
        </div>

        <div className="a-order-detail-footer">
          <span>
            <Icon name="lock" size={15} />
            Monitoring only. Kitchen staff manage preparation.
          </span>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

