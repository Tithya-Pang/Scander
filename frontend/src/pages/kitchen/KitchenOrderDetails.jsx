import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import { DishThumb, StatusPill, TableTag, TypeTag } from '../../components/kitchen/KitchenTags';
import { useKitchen } from '../../context/KitchenContext';
import { getKitchenOrder, kitchenErrorMessage } from '../../services/kitchenService';
import { dishCount, formatClock, formatDate, formatMoney, orderTotals, prepMinutes, TAX_RATE } from '../../data/kitchenOrders';

function Timing({ icon, label, value }) {
  return <div className="k-timing"><span><Icon name={icon} size={20}/></span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

export default function KitchenOrderDetails() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const { history } = useKitchen();
  const id = orderId.replace(/^#/, '');
  const cached = history.find(entry => String(entry.id) === id);
  // Orders outside the loaded history are fetched directly from the backend.
  const [fetched, setFetched] = useState({ id: null, order: null, error: null });
  const backTo = `/kitchen/history${state?.from ? `?${state.from}` : ''}`;

  useEffect(() => {
    if (cached) return undefined;
    let cancelled = false;
    getKitchenOrder(id)
      .then(order => { if (!cancelled) setFetched({ id, order, error: null }); })
      .catch(error => { if (!cancelled) setFetched({ id, order: null, error }); });
    return () => { cancelled = true; };
  }, [cached, id]);

  const order = cached ?? (fetched.id === id ? fetched.order : null);
  const loading = !cached && fetched.id !== id;
  const failed = !cached && fetched.id === id && fetched.error && fetched.error.status !== 404 && fetched.error.status !== 400;

  if (loading || failed || !order || !order.completedAt) return <section className="k-page">
    <nav className="k-breadcrumb" aria-label="Breadcrumb"><Link to={backTo}>Order History</Link><span>/</span><span>#{order?.number ?? id}</span></nav>
    {loading
      ? <div className="k-card k-empty" role="status"><h2>Loading order #{id}…</h2></div>
      : <div className="k-card k-empty" role={failed ? 'alert' : undefined}>
        <h2>{failed ? 'Could not load this order' : order?.cancelled ? `Order #${order.number} was cancelled`
          : order ? `Order #${order.number} is still in the kitchen` : `Order #${id} was not found`}</h2>
        <p>{failed ? kitchenErrorMessage(fetched.error) : order?.cancelled ? 'Cancelled orders have no preparation details.'
          : order ? 'Details appear here once every dish has been served.' : 'It may belong to another restaurant or have been removed.'}</p>
        <Link className="k-btn k-btn-primary" to={order && !order.cancelled ? '/kitchen' : backTo}>{order && !order.cancelled ? 'Go to Kitchen Queue' : 'Back to History'}</Link>
      </div>}
  </section>;

  const { subtotal, tax, total } = orderTotals(order);
  const dishes = dishCount(order);

  return <section className="k-page">
    <nav className="k-breadcrumb k-no-print" aria-label="Breadcrumb"><Link to={backTo}>Order History</Link><span>/</span><span aria-current="page">#{order.number}</span></nav>
    <header className="k-page-head">
      <div><h1>Order Details</h1><p>View completed order information.</p></div>
      <div className="k-head-actions k-no-print">
        <Link className="k-btn k-btn-outline" to={backTo}><Icon name="chevronLeft" size={18}/>Back to History</Link>
        <button type="button" className="k-btn k-btn-primary" onClick={() => window.print()}><Icon name="printer" size={18}/>Print Slip</button>
      </div>
    </header>

    <div className="k-card k-detail-summary">
      <div className="k-detail-title">
        <h2>Order #{order.number}</h2>
        <StatusPill status="completed"/><TableTag table={order.table}/><TypeTag type={order.type}/>
      </div>
      <div className="k-timings">
        <Timing icon="clock" label="Order time" value={formatClock(order.receivedAt)}/>
        <Timing icon="checkCircle" label="Completed" value={formatClock(order.completedAt)}/>
        <Timing icon="timer" label="Prep time" value={`${prepMinutes(order)} min`}/>
      </div>
      <small className="k-detail-date">{formatDate(order.completedAt)}</small>
    </div>

    <div className="k-card">
      <h2 className="k-section-title"><Icon name="utensils" size={22}/>Items Ordered</h2>
      <div className="k-table-scroll"><table className="k-table k-items-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Modifiers / Notes</th><th className="k-num">Price</th><th className="k-num">Total</th><th>Status</th></tr></thead>
        <tbody>{order.items.map(item => <tr key={item.lineId}>
          <td><span className="k-item-cell"><DishThumb item={item} size="lg"/><strong>{item.name}</strong></span></td>
          <td>{item.qty}</td>
          <td className="k-muted">{item.note || '—'}</td>
          <td className="k-num">{formatMoney(item.price)}</td>
          <td className="k-num">{formatMoney(item.price * item.qty)}</td>
          <td><StatusPill status="completed"/></td>
        </tr>)}</tbody>
      </table></div>
      <dl className="k-receipt">
        <div><dt>Subtotal <span>({dishes} {dishes === 1 ? 'item' : 'items'})</span></dt><dd>{formatMoney(subtotal)}</dd></div>
        <div><dt>Tax ({Math.round(TAX_RATE * 100)}%)</dt><dd>{formatMoney(tax)}</dd></div>
        <div className="k-receipt-total"><dt>Total</dt><dd>{formatMoney(total)}</dd></div>
      </dl>
    </div>
  </section>;
}
