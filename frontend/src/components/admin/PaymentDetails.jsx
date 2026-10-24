
import { useEffect } from 'react';

const money = value => `$${value.toFixed(2)}`;

export default function PaymentDetails({ payment, onClose }) {
  useEffect(() => {
    if (!payment) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [payment, onClose]);

  if (!payment) return null;

  const isPaid = payment.status === 'Paid';
  const total = payment.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="admin-payment-overlay" onClick={onClose}>
      <div
        className="card admin-payment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-detail-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="admin-payment-dialog-header">
          <div>
            <span className="eyebrow">GATHER GROUNDS</span>
            <h2 id="payment-detail-title">
              {isPaid ? 'Receipt Preview' : 'Payment Details'}
            </h2>
            <p className="muted">
              {payment.orderId} · {payment.table}
            </p>
          </div>

          <button
            type="button"
            className="admin-dialog-close"
            onClick={onClose}
            aria-label="Close payment details"
          >
            ×
          </button>
        </div>

        <div className="admin-receipt-notice">
          SAMPLE DATA — NOT A VALID PAYMENT RECEIPT
        </div>

        <div className="admin-payment-meta">
          <div>
            <span>Order</span>
            <strong>{payment.orderId}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{payment.date}</strong>
          </div>
          <div>
            <span>Method</span>
            <strong>{payment.method || 'Not paid'}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{payment.status}</strong>
          </div>
        </div>

        <h3>Order Items</h3>

        <div className="admin-receipt-items">
          {payment.items.map((item, index) => (
            <div key={index} className="admin-receipt-line">
              <div>
                <strong>{item.name}</strong>
                <p className="muted">
                  {item.quantity} × {money(item.price)}
                </p>
              </div>
              <strong>
                {money(item.price * item.quantity)}
              </strong>
            </div>
          ))}
        </div>

        <div className="admin-receipt-total">
          <span>Order Total (Demo)</span>
          <strong>{money(total)}</strong>
        </div>

        <p className="muted admin-receipt-footnote">
          {isPaid
            ? 'This is a sample receipt using demonstration data.'
            : 'Payment is pending. No receipt has been issued.'}
        </p>

        <div className="admin-form-actions admin-payment-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>

          {isPaid && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              Print Sample Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
