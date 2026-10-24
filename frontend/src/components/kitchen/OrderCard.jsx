import { useState } from 'react';
import Icon from '../common/Icon';
import { DishThumb, StatusPill, TableTag, TypeTag } from './KitchenTags';
import { useKitchen } from '../../context/KitchenContext';
import { countByStatus, dishCount, minutesBetween, RUSH_THRESHOLD_MINUTES } from '../../data/kitchenOrders';

const stateLabels = { preparing: 'Preparing', ready: 'Ready' };

// `showState` prints the dish status under its name, leaving the right slot for one action.
function DishRow({ item, showState, children }) {
  const state = showState && stateLabels[item.status];
  return <li className={`k-dish${item.status === 'served' ? ' k-dish-served' : ''}`}>
    <DishThumb item={item}/>
    <span className="k-dish-name">
      <strong><span className={`k-qty${item.qty > 1 ? ' k-qty-multi' : ''}`}>{item.qty}×</span>{item.name}</strong>
      {(state || item.note) && <small>{state && <span className={`k-dish-state k-dish-state-${item.status}`}>{state}</span>}{item.note}</small>}
    </span>
    {children && <span className="k-dish-actions">{children}</span>}
  </li>;
}

function Progress({ done, total, label, detail }) {
  return <div className="k-progress">
    <div className="k-progress-text"><strong>{label}</strong>{detail && <span>{detail}</span>}</div>
    <div className="k-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
      <span style={{ width: `${total ? (done / total) * 100 : 0}%` }}/>
    </div>
  </div>;
}

export default function OrderCard({ order, stage }) {
  const { now, settings, acceptOrder, setDishStatus, serveAllReady } = useKitchen();
  const [partialPickup, setPartialPickup] = useState(false);
  const elapsed = minutesBetween(order.receivedAt, now);
  const rush = settings.rushAlerts && elapsed >= RUSH_THRESHOLD_MINUTES;
  const counts = countByStatus(order);
  const total = order.items.length;
  const remaining = total - counts.served;

  function dishAction(item) {
    if (item.status === 'preparing') return <button type="button" className="k-btn k-btn-outline k-btn-sm" aria-label={`Mark ${item.name} ready`} onClick={() => setDishStatus(order.id, item.lineId, 'ready')}>Mark Ready</button>;
    if (item.status === 'ready') return <button type="button" className="k-btn k-btn-primary k-btn-sm" aria-label={`Mark ${item.name} served`} onClick={() => setDishStatus(order.id, item.lineId, 'served')}>Mark Served</button>;
    return <StatusPill status="served"/>;
  }

  return <article className={`k-order${rush ? ' k-order-rush' : ''}`} aria-label={`Order ${order.id}`}>
    <header className="k-order-head">
      <strong className="k-order-id">#{order.id}</strong>
      <TableTag table={order.table}/>
      <TypeTag type={order.type}/>
      <span className="k-elapsed" title={rush ? `Waiting longer than ${RUSH_THRESHOLD_MINUTES} minutes` : 'Time since order was placed'}>
        <Icon name={rush ? 'alert' : 'clock'} size={16}/>{elapsed}m
      </span>
    </header>

    {stage === 'received' && <>
      <p className="k-order-sub">{dishCount(order)} {dishCount(order) === 1 ? 'dish' : 'dishes'}</p>
      <ul className="k-dishes">{order.items.map(item => <DishRow key={item.lineId} item={item}/>)}</ul>
      <button type="button" className="k-btn k-btn-primary k-btn-block" onClick={() => acceptOrder(order.id)}><Icon name="play" size={16}/>Accept Preparation</button>
    </>}

    {stage === 'preparing' && <>
      <Progress done={counts.ready + counts.served} total={total} label={`${counts.ready + counts.served} of ${total} dishes prepared`}
        detail={[counts.served && `${counts.served} served`, counts.ready && `${counts.ready} ready`, `${counts.preparing} preparing`].filter(Boolean).join(' · ')}/>
      <ul className="k-dishes">{order.items.map(item => <DishRow key={item.lineId} item={item} showState>{dishAction(item)}</DishRow>)}</ul>
    </>}

    {stage === 'ready' && <>
      <Progress done={remaining} total={remaining} label={`${remaining} of ${remaining} ${remaining === 1 ? 'dish' : 'dishes'} ready to serve`}
        detail={counts.served ? `${counts.served} already served` : ''}/>
      <ul className="k-dishes">{order.items.map(item => <DishRow key={item.lineId} item={item} showState={partialPickup}>
        {item.status === 'ready' && partialPickup
          ? <button type="button" className="k-btn k-btn-outline k-btn-sm" aria-label={`Mark ${item.name} served`} onClick={() => setDishStatus(order.id, item.lineId, 'served')}>Mark Served</button>
          : <StatusPill status={item.status}/>}
      </DishRow>)}</ul>
      <button type="button" className="k-btn k-btn-primary k-btn-block" onClick={() => serveAllReady(order.id)}><Icon name="check" size={18}/>Mark as Served (All)</button>
      {remaining > 1 && <button type="button" className="k-link-button" aria-pressed={partialPickup} onClick={() => setPartialPickup(value => !value)}>
        {partialPickup ? 'Done with partial pickup' : 'Partial pickup? Serve dishes individually'}
      </button>}
    </>}
  </article>;
}
