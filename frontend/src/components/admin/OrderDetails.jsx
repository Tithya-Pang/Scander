
export default function OrderDetails({ order, onClose }) {
  if (!order) return null;

  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      className="admin-order-overlay"
      onClick={onClose}
    >
      <div
        className="card admin-order-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="admin-order-dialog-header">
          <div>
            <span className="eyebrow">ORDER DETAILS</span>
            <h2 id="order-detail-title">{order.id}</h2>
            <p className="muted">{order.table} · {order.time}</p>
          </div>

          <button
            type="button"
            className="admin-dialog-close"
            onClick={onClose}
            aria-label="Close order details"
          >
            ×
          </button>
        </div>

        <div className="admin-order-detail-info">
          <div>
            <span className="muted">Order Status</span>
            <strong>{order.status}</strong>
          </div>
          <div>
            <span className="muted">Payment</span>
            <strong>{order.paymentStatus}</strong>
          </div>
        </div>

        <h3>Ordered Items</h3>

        <div className="admin-order-item-list">
          {order.items.map((item, index) => (
            <div className="admin-order-item" key={index}>
              <div>
                <strong>{item.name}</strong>
                <p className="muted">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <strong>
                ${(item.price * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div className="admin-order-grand-total">
          <strong>Sample Total</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>

        <div className="admin-order-note">
          <strong>Kitchen Instructions</strong>
          <p className="muted">
            {order.instructions || 'No special instructions.'}
          </p>
        </div>

        <div className="admin-form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
