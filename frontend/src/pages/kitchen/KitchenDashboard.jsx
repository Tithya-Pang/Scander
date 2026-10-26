import KanbanColumn from '../../components/kitchen/KanbanColumn';
import { KitchenStat } from '../../components/kitchen/KitchenTags';
import { useKitchen } from '../../context/KitchenContext';
import { getOrderStage, minutesBetween, prepMinutes, RUSH_THRESHOLD_MINUTES } from '../../data/kitchenOrders';

const columns = [
  { stage: 'received', title: 'Received', icon: 'inbox', hint: 'New orders · acknowledge and send to kitchen', empty: 'No new orders. Incoming tickets appear here.' },
  { stage: 'preparing', title: 'Preparing', icon: 'flame', hint: 'Update each dish as it comes off the line', empty: 'Nothing on the line right now.' },
  { stage: 'ready', title: 'Ready to Serve', icon: 'cloche', hint: 'All remaining dishes ready for pickup by waitstaff', empty: 'No orders waiting for pickup.' },
];

export default function KitchenDashboard() {
  const { orders, ordersStatus, ordersError, refreshOrders, history, now } = useKitchen();
  const byStage = { received: [], preparing: [], ready: [] };
  const today = new Date(now).toDateString();
  orders.forEach(order => {
    const stage = getOrderStage(order);
    if (byStage[stage]) byStage[stage].push(order);
  });
  const completedToday = history.filter(order => new Date(order.completedAt).toDateString() === today);
  Object.values(byStage).forEach(list => list.sort((a, b) => a.receivedAt - b.receivedAt));
  const active = [...byStage.received, ...byStage.preparing, ...byStage.ready];
  const waiting = active.filter(order => minutesBetween(order.receivedAt, now) >= RUSH_THRESHOLD_MINUTES).length;
  const avgPrep = completedToday.length ? completedToday.reduce((sum, order) => sum + prepMinutes(order), 0) / completedToday.length : null;

  return <section className="k-page">
    <header className="k-page-head">
      <div>
        <div className="k-title-row"><h1>Kitchen Queue</h1><span className="k-live" title="Orders refresh from the kitchen server every 20 seconds">{ordersStatus === 'ready' && ordersError ? 'Reconnecting…' : 'Live'}</span></div>
        <p>Track and update dishes in real time. Keep the good food flowing.</p>
      </div>
      <div className="k-stats">
        <KitchenStat icon="clock" value={avgPrep === null ? '—' : `${avgPrep.toFixed(1)}m`} label="Avg. prep time today"/>
        <KitchenStat icon="cloche" value={active.length} label="Active orders"/>
        <KitchenStat icon="alert" value={waiting} label={`Waiting ≥ ${RUSH_THRESHOLD_MINUTES} min`} tone={waiting ? 'warn' : undefined}/>
      </div>
    </header>
    {ordersStatus === 'error'
      ? <div className="k-card k-empty" role="alert"><h2>Could not load kitchen orders</h2><p>{ordersError}</p><button type="button" className="k-btn k-btn-primary" onClick={refreshOrders}>Try again</button></div>
      : <div className="k-board" aria-busy={ordersStatus === 'loading'}>{columns.map(column => <KanbanColumn key={column.stage} {...column}
        empty={ordersStatus === 'loading' ? 'Loading orders…' : column.empty} orders={byStage[column.stage]}/>)}</div>}
  </section>;
}
