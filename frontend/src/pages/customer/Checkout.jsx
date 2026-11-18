import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../services/orders';
import { createRequestId, readPending, savePending, clearPending, saveReceipt } from '../../utils/orderReceipt';
import PaymentOptions from '../../components/customer/PaymentOptions';
import { cardBrand, digitsOnly, validateCard } from '../../utils/card';

const emptyCard = { name: '', number: '', expiry: '', cvc: '' };

export default function Checkout() {
  const { total, count, instructions, items, clearCart } = useCart();
  const { search } = useLocation();
  const navigate = useNavigate();
  const qr = new URLSearchParams(search).get('qr') || '';
  const { tableSession } = useOutletContext();
  const { table, loading: checkingTable, error: tableError, retry: retryTable } = tableSession;
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState(() => readPending(qr));
  const [paymentMethod, setPaymentMethod] = useState('COUNTER');
  const [card, setCard] = useState(emptyCard);
  const [cardErrors, setCardErrors] = useState({});
  const inFlight = useRef(false);
  useEffect(() => { setError(''); setPending(readPending(qr)); }, [qr]);

  function paymentSummary() {
    if (paymentMethod !== 'CARD') return { method: 'COUNTER' };
    const digits = digitsOnly(card.number);
    // Only these two card facts leave the browser.
    return { method: 'CARD', brand: cardBrand(digits), last4: digits.slice(-4) };
  }

  async function submit() {
    if (inFlight.current || !table) return;
    if (!pending && paymentMethod === 'CARD') {
      const errors = validateCard(card);
      setCardErrors(errors);
      if (Object.keys(errors).length) return;
    }
    inFlight.current = true; setSubmitting(true); setError('');
    const request = pending || {
      tableToken: qr, requestId: createRequestId(), receiptToken: createRequestId(),
      items: items.map(item => ({ itemId: item.id, quantity: item.quantity, priceCents: Math.round(item.price * 100) })),
      instructions, payment: paymentSummary(),
    };
    try {
      savePending(qr, request); setPending(request);
      const order = await placeOrder(request);
      const receipt = { id: order.id, token: request.receiptToken, tableToken: qr };
      saveReceipt(qr, receipt); clearPending(qr); setPending(null); clearCart(); setCard(emptyCard);
      navigate({ pathname: '/customer/orders', search }, { state: { receipt, order } });
    } catch (error) {
      setError(error.message || 'Could not place the order. Please retry.');
      // Known validation failures did not save an order. Network/503 failures retain the same retry ID.
      if ([400, 409, 429].includes(error.status)) { clearPending(qr); setPending(null); }
    } finally { inFlight.current = false; setSubmitting(false); }
  }

  return <section className="checkout-preview"><span className="eyebrow">GATHER GROUNDS</span><h1>Review your order</h1><div className="card"><h2>{count ? `${count} ${count === 1 ? 'item' : 'items'} · $${total.toFixed(2)}` : pending ? 'Check your pending submission' : 'Your cart is empty'}</h2>{table && <p>Table #{table.number}</p>}{count > 0 && <ul className="checkout-item-list">{items.map(item => <li key={item.id}><span>{item.quantity} × {item.name}</span><strong>${(item.quantity * item.price).toFixed(2)}</strong></li>)}</ul>}{instructions && <p>Kitchen instructions: {instructions}</p>}{!qr && <div id="checkout-table-requirement" className="checkout-table-notice" role="alert"><strong>Scan your table QR to place an order</strong><p>We need your table before we can send this order to the kitchen. Scan the QR printed on your table, then return to checkout.</p></div>}{checkingTable && <p role="status">Verifying your table with the restaurant…</p>}{tableError && <div className="checkout-table-notice" role="alert"><p>{tableError}</p><button className="btn btn-outline btn-small" onClick={retryTable}>Check table again</button></div>}{error && <p role="alert">{error}</p>}{pending && <p>A previous submission needs confirmation. Retry uses the same order request to prevent duplicates.</p>}<p className="muted">Prices and availability are checked with the restaurant before your order is saved. Total includes estimated 8% tax.</p>{count > 0 && !pending && <PaymentOptions method={paymentMethod} onMethodChange={method => { setPaymentMethod(method); setCardErrors({}); }} card={card} onCardChange={setCard} errors={cardErrors} total={total} disabled={submitting}/>}<div className="tracking-actions">{(count > 0 || pending) && <button className="btn btn-primary" disabled={!table || checkingTable || submitting} aria-describedby={!qr ? "checkout-table-requirement" : undefined} onClick={submit}>{submitting ? 'Saving order…' : checkingTable ? 'Verifying table…' : !qr ? 'Scan table QR to order' : !table ? 'Table unavailable' : pending ? 'Check / retry order' : paymentMethod === 'CARD' ? `Pay $${total.toFixed(2)} & place order` : 'Place order'}</button>}<Link className="btn btn-outline" to={{ pathname: '/customer/menu', search }}>Back to menu</Link></div></div></section>;
}
