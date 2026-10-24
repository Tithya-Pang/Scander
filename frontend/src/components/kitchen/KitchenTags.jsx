import { useState } from 'react';
import Icon from '../common/Icon';

export function DishThumb({ item, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  return <span className={`k-thumb k-thumb-${size}`}>
    {item.image && !failed
      ? <img src={item.image} alt="" loading="lazy" style={{ objectPosition: item.imagePosition || 'center' }} onError={() => setFailed(true)}/>
      : <span aria-hidden="true">{item.name.charAt(0)}</span>}
  </span>;
}

export const TableTag = ({ table }) => <span className="k-tag k-tag-table">Table {table}</span>;

export const TypeTag = ({ type }) => <span className="k-tag k-tag-type">
  <Icon name={type === 'takeaway' ? 'bag' : 'utensils'} size={14}/>{type === 'takeaway' ? 'Takeaway' : 'Dine-in'}
</span>;

const statusLabels = { pending: 'New', preparing: 'Preparing', ready: 'Ready', served: 'Served', completed: 'Completed' };
const statusIcons = { preparing: 'timer', ready: 'bell', served: 'checkCircle', completed: 'checkCircle' };

export function StatusPill({ status }) {
  return <span className={`k-status k-status-${status}`}>
    {statusIcons[status] && <Icon name={statusIcons[status]} size={14}/>}{statusLabels[status]}
  </span>;
}

export function KitchenStat({ icon, value, label, tone }) {
  return <div className={`k-stat${tone ? ` k-stat-${tone}` : ''}`}>
    <Icon name={icon} size={24}/><span><strong>{value}</strong><small>{label}</small></span>
  </div>;
}
