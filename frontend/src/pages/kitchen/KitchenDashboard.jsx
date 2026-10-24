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
  const { orders, now } = useKitchen();
  const byStage = { received: [], preparing: [], ready: [] };
  const completedToday = [];
  const today = new Date(now).toDateString();
  orders.forEach(order => {
    const stage = getOrderStage(order);
    if (byStage[stage]) byStage[stage].push(order);
    else if (new Date(order.completedAt).toDateString() === today) completedToday.push(order);
  });
  Object.values(byStage).forEach(list => list.sort((a, b) => a.receivedAt - b.receivedAt));
  const active = [...byStage.received, ...byStage.preparing, ...byStage.ready];
  const waiting = active.filter(order => minutesBetween(order.receivedAt, now) >= RUSH_THRESHOLD_MINUTES).length;
  const avgPrep = completedToday.length ? completedToday.reduce((sum, order) => sum + prepMinutes(order), 0) / completedToday.length : null;

  return <section className="k-page">
    <header className="k-page-head">
      <div>
        <div className="k-title-row"><h1>Kitchen Queue</h1><span className="k-live" title="Orders are simulated in the browser until the backend is connected">Live · demo data</span></div>
        <p>Track and update dishes in real time. Keep the good food flowing.</p>
      </div>
      <div className="k-stats">
        <KitchenStat icon="clock" value={avgPrep === null ? '—' : `${avgPrep.toFixed(1)}m`} label="Avg. prep time today"/>
        <KitchenStat icon="cloche" value={active.length} label="Active orders"/>
        <KitchenStat icon="alert" value={waiting} label={`Waiting ≥ ${RUSH_THRESHOLD_MINUTES} min`} tone={waiting ? 'warn' : undefined}/>
      </div>
    </header>
    <div className="k-board">{columns.map(column => <KanbanColumn key={column.stage} {...column} orders={byStage[column.stage]}/>)}</div>
  </section>;
}
