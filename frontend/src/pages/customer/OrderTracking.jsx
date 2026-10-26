import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import { useCart } from '../../context/CartContext';
import { orderStages, getTableContext } from '../../utils/orderStatus';
import { readReceipt } from '../../utils/orderReceipt';
import { getOrder } from '../../services/orders';

const money = value => `$${value.toFixed(2)}`;
export default function OrderTracking() {
  const { search, state } = useLocation();
  const qr = new URLSearchParams(search).get('qr') || '';
  const table = getTableContext(search);
  const { count } = useCart();
  const receipt = readReceipt(qr) || (state?.receipt?.tableToken === qr ? state.receipt : null);
  const [result, setResult] = useState({ key: '', order: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(receipt));
  const [reload, setReload] = useState(0);
  const receiptKey = receipt ? `${qr}:${receipt.id}` : '';
  const order = result.key === receiptKey ? result.order : null;

  useEffect(() => {
    const controller = new AbortController();
    let timeout;
    setError(''); setLoading(Boolean(receipt));
    if (!receipt) { setResult({ key: '', order: null }); return () => controller.abort(); }
    async function refresh() {
      try {
        const next = await getOrder(receipt, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setResult({ key: receiptKey, order: next }); setError('');
        if (!['SERVED', 'CANCELLED'].includes(next.status)) timeout = setTimeout(refresh, 5000);
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(error.message);
        if (![400, 404].includes(error.status)) timeout = setTimeout(refresh, 10000);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    refresh();
    return () => { controller.abort(); clearTimeout(timeout); };
    // Scalar receipt fields keep polling stable across unrelated renders.
  }, [receiptKey, receipt?.token, reload]);

  const index = order ? orderStages.findIndex(stage => stage.status === order.status) : -1;
  const stage = order?.status === 'CANCELLED' ? { label: 'Cancelled', icon: 'alert', description: 'This order was cancelled. Please ask a staff member if you need help.' }
    : orderStages[index] || { label: 'Updating', icon: 'clock', description: 'Waiting for the latest order status.' };

  return <section className="tracking-page">
    <header className="tracking-heading"><div><span className="eyebrow">GATHER GROUNDS</span><h1>Order Tracking</h1><p>Follow your meal from the kitchen to your table.</p></div>{(order?.table || table) && <span className="tracking-table"><Icon name="utensils" size={18}/> Table #{order?.table || table}</span>}</header>
    {loading && !order && <p role="status">Loading your order…</p>}
    {error && <div className="card" role="alert"><h2>We couldn’t refresh your order</h2><p>{error}</p>{order && <p>The last saved status is shown below.</p>}<button className="btn btn-outline" onClick={() => setReload(value => value + 1)}>Try again</button></div>}
    {!receipt && <>
      <div className="card tracking-empty"><span className="tracking-empty-icon"><Icon name="bag" size={38}/></span><h2>No orders placed yet</h2><p>After placing an order, its saved status will appear here in this browser tab.</p>{count > 0 && <p className="tracking-cart-note">You have {count} {count === 1 ? 'item' : 'items'} in your cart, ready to review.</p>}<div className="tracking-actions"><Link className="btn btn-primary" to={{ pathname: count ? '/customer/checkout' : '/customer/menu', search }}>{count ? 'Review your cart' : 'Explore the menu'}<Icon name="chevronRight" size={17}/></Link></div></div>
      <div className="card tracking-explainer"><h2>From our kitchen to your table</h2><ol className="tracking-steps tracking-steps-inactive">{orderStages.map(item => <li key={item.status}><span className="tracking-step-icon"><Icon name={item.icon} size={22}/></span><strong>{item.label}</strong><p>{item.description}</p></li>)}</ol></div>
    </>}
    {order && <div className="tracking-grid">
      <div className="tracking-primary">
        <div className="card tracking-progress"><div className="tracking-progress-top"><span className="eyebrow">{order.number}</span><span className="tracking-status">{stage.label}</span></div><div className="tracking-status-message" role="status"><span className="tracking-current-icon"><Icon name={stage.icon} size={32}/></span><div><h2>{stage.label === 'Received' ? 'Order received' : stage.label === 'Preparing' ? 'A little goodness in the making' : stage.label === 'Ready' ? 'Ready for your table' : stage.label === 'Served' ? 'Enjoy every bite' : stage.label}</h2><p>{stage.description}</p></div></div>{order.status !== 'CANCELLED' && <ol className="tracking-steps">{orderStages.map((item, stageIndex) => <li key={item.status} className={stageIndex <= index ? 'is-complete' : ''} aria-current={stageIndex === index ? 'step' : undefined}><span className="tracking-step-icon"><Icon name={stageIndex < index ? 'check' : item.icon} size={22}/></span><strong>{item.label}</strong></li>)}</ol>}<p className="tracking-footnote">Saved to the restaurant database. Status refreshes automatically.</p></div>
        <Link className="tracking-back" to={{ pathname: '/customer/menu', search }}><Icon name="chevronLeft" size={17}/> Back to menu</Link>
      </div>
      <aside className="card tracking-receipt"><div className="tracking-receipt-header"><h2>Your order summary</h2><span>{order.count} {order.count === 1 ? 'item' : 'items'}</span></div><ul>{order.items.map(item => <li key={item.id}><span className="tracking-item-quantity">{item.quantity}×</span><span>{item.name}</span><strong>{money(item.price * item.quantity)}</strong></li>)}</ul>{order.instructions && <div className="tracking-instructions"><h3><Icon name="note" size={17}/> Kitchen instructions</h3><p>{order.instructions}</p></div>}<dl className="order-totals"><div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div><div><dt>Tax (8%)</dt><dd>{money(order.tax)}</dd></div><div className="order-total"><dt>Total</dt><dd>{money(order.total)}</dd></div></dl><p className="tracking-footnote">Payment is handled separately.</p></aside>
    </div>}
  </section>;
}
