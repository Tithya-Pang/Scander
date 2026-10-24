import Icon from '../common/Icon';
import OrderCard from './OrderCard';

export default function KanbanColumn({ stage, title, icon, hint, orders, empty }) {
  return <section className={`k-column k-column-${stage}`} aria-labelledby={`k-column-${stage}`}>
    <header className="k-column-head">
      <span className="k-column-icon"><Icon name={icon} size={22}/></span>
      <div><h2 id={`k-column-${stage}`}>{title}</h2><p>{hint}</p></div>
      <span className="k-count" aria-label={`${orders.length} orders`}>{orders.length}</span>
    </header>
    <div className="k-column-list">
      {orders.length ? orders.map(order => <OrderCard key={order.id} order={order} stage={stage}/>) : <p className="k-column-empty">{empty}</p>}
    </div>
  </section>;
}
