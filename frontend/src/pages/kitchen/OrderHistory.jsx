import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import { KitchenStat, StatusPill, TableTag } from '../../components/kitchen/KitchenTags';
import { useKitchen } from '../../context/KitchenContext';
import { dishCount, formatClock, formatDate, itemSummary, orderTotals, prepMinutes, RUSH_THRESHOLD_MINUTES } from '../../data/kitchenOrders';

const PAGE_SIZE = 10;
const DAY = 24 * 60 * 60 * 1000;
const dateOptions = [['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'Last 7 days'], ['all', 'All time']];
const statusOptions = [['completed', 'Status: Completed'], ['on-time', 'Status: On time'], ['delayed', `Status: Delayed (≥ ${RUSH_THRESHOLD_MINUTES} min)`]];
const defaults = { q: '', date: 'week', table: 'all', status: 'completed', page: '1' };

function inDateRange(time, range, now) {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  if (range === 'today') return time >= startOfToday;
  if (range === 'yesterday') return time >= startOfToday - DAY && time < startOfToday;
  if (range === 'week') return time >= startOfToday - 6 * DAY;
  return true;
}

function matchesSearch(order, query) {
  if (!query) return true;
  const text = query.toLowerCase().replace(/^#/, '');
  return String(order.id).includes(text) || `table ${order.table}` === text || String(order.table) === text
    || order.items.some(item => item.name.toLowerCase().includes(text));
}

function exportCsv(rows) {
  const header = ['Order ID', 'Date', 'Table', 'Type', 'Items', 'Notes', 'Order Time', 'Completed', 'Prep (min)', 'Dishes', 'Total'];
  const lines = rows.map(order => [`#${order.id}`, formatDate(order.completedAt), order.table, order.type, itemSummary(order),
    order.items.filter(item => item.note).map(item => `${item.name}: ${item.note}`).join('; '), formatClock(order.receivedAt),
    formatClock(order.completedAt), prepMinutes(order), dishCount(order), orderTotals(order).total.toFixed(2)]);
  const csv = [header, ...lines].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `kitchen-order-history-${new Date().toISOString().slice(0, 10)}.csv` });
  link.click();
  URL.revokeObjectURL(url);
}

function FilterSelect({ icon, label, value, options, onChange }) {
  return <label className="k-select"><Icon name={icon} size={18}/>
    <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select>
    <Icon name="chevronDown" size={16}/>
  </label>;
}

export default function OrderHistory() {
  const { orders, now } = useKitchen();
  const [params, setParams] = useSearchParams();
  const filters = { ...defaults, ...Object.fromEntries(params) };
  const setFilter = (key, value) => setParams(current => {
    const next = new URLSearchParams(current);
    value === defaults[key] ? next.delete(key) : next.set(key, value);
    if (key !== 'page') next.delete('page');
    return next;
  }, { replace: true });

  const completed = orders.filter(order => order.completedAt).sort((a, b) => b.completedAt - a.completedAt);
  const tables = [...new Set(completed.map(order => order.table))].sort((a, b) => a - b);
  const rows = completed.filter(order => matchesSearch(order, filters.q.trim())
    && inDateRange(order.completedAt, filters.date, now)
    && (filters.table === 'all' || String(order.table) === filters.table)
    && (filters.status === 'completed' || (filters.status === 'delayed') === (prepMinutes(order) >= RUSH_THRESHOLD_MINUTES)));

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(filters.page) || 1), pageCount);
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const avgPrep = rows.length ? rows.reduce((sum, order) => sum + prepMinutes(order), 0) / rows.length : null;
  const today = new Date(now).toDateString();

  return <section className="k-page">
    <header className="k-page-head">
      <div><h1>Order History</h1><p>View completed orders and preparation metrics.</p></div>
      <div className="k-stats">
        <KitchenStat icon="checkCircle" value={rows.length} label="Completed orders"/>
        <KitchenStat icon="timer" value={avgPrep === null ? '—' : `${avgPrep.toFixed(1)}m`} label="Avg. prep time"/>
        <KitchenStat icon="file" value={rows.reduce((sum, order) => sum + dishCount(order), 0)} label="Total dishes"/>
        <button type="button" className="k-btn k-btn-primary" disabled={!rows.length} onClick={() => exportCsv(rows)}><Icon name="download" size={18}/>Export CSV</button>
      </div>
    </header>

    <div className="k-card k-filters">
      <label className="k-search"><Icon name="search" size={20}/>
        <input type="search" aria-label="Search order history" placeholder="Search order ID (e.g. #1024), table number, or item name..." value={filters.q} onChange={event => setFilter('q', event.target.value)}/>
      </label>
      <FilterSelect icon="calendar" label="Date range" value={filters.date} options={dateOptions} onChange={value => setFilter('date', value)}/>
      <FilterSelect icon="grid" label="Table" value={filters.table} options={[['all', 'All Tables'], ...tables.map(table => [String(table), `Table ${table}`])]} onChange={value => setFilter('table', value)}/>
      <FilterSelect icon="checkCircle" label="Status" value={filters.status} options={statusOptions} onChange={value => setFilter('status', value)}/>
      <button type="button" className="k-icon-button" aria-label="Reset filters" title="Reset filters" onClick={() => setParams({}, { replace: true })}><Icon name="refresh" size={18}/></button>
    </div>

    <div className="k-card k-table-card">
      <div className="k-table-scroll"><table className="k-table">
        <thead><tr><th>Order ID</th><th>Table</th><th>Items summary</th><th>Order time</th><th>Completed</th><th>Prep time</th><th>Status</th><th><span className="k-sr-only">Action</span></th></tr></thead>
        <tbody>{visible.map(order => {
          const notes = order.items.filter(item => item.note).map(item => item.note).join(', ');
          const prep = prepMinutes(order);
          // When searching by item, list the matching dishes first so they aren't hidden behind "+N more".
          const query = filters.q.trim().toLowerCase();
          const items = query ? [...order.items].sort((a, b) => b.name.toLowerCase().includes(query) - a.name.toLowerCase().includes(query)) : order.items;
          return <tr key={order.id}>
            <td><strong className="k-order-id">#{order.id}</strong></td>
            <td><TableTag table={order.table}/></td>
            <td className="k-summary-cell">
              <span className="k-summary">{items.slice(0, 2).map(item => `${item.name} ×${item.qty}`).join(', ')}{order.items.length > 2 && <span className="k-more">+{order.items.length - 2} more</span>}</span>
              {notes && <small>{notes}</small>}
            </td>
            <td className="k-time">{formatClock(order.receivedAt)}{new Date(order.completedAt).toDateString() !== today && <small>{formatDate(order.completedAt)}</small>}</td>
            <td className="k-time">{formatClock(order.completedAt)}</td>
            <td className={prep >= RUSH_THRESHOLD_MINUTES ? 'k-prep-late' : undefined}>{prep} min</td>
            <td><StatusPill status="completed"/></td>
            <td><Link className="k-btn k-btn-outline k-btn-sm" to={`/kitchen/history/${order.id}`} state={{ from: params.toString() }}>Details<Icon name="chevronRight" size={14}/></Link></td>
          </tr>;
        })}</tbody>
      </table></div>
      {!rows.length && <div className="k-empty"><h2>No completed orders match</h2><p>Try a different search, date range, or table.</p><button type="button" className="k-btn k-btn-outline" onClick={() => setParams({}, { replace: true })}>Reset filters</button></div>}
      {rows.length > 0 && <footer className="k-pagination">
        <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} completed orders</span>
        <nav aria-label="Pagination">
          <button type="button" className="k-page-button" aria-label="Previous page" disabled={page === 1} onClick={() => setFilter('page', String(page - 1))}><Icon name="chevronLeft" size={16}/></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button type="button" key={number} className={`k-page-button${number === page ? ' active' : ''}`} aria-current={number === page ? 'page' : undefined} onClick={() => setFilter('page', String(number))}>{number}</button>)}
          <button type="button" className="k-page-button" aria-label="Next page" disabled={page === pageCount} onClick={() => setFilter('page', String(page + 1))}><Icon name="chevronRight" size={16}/></button>
        </nav>
      </footer>}
    </div>
  </section>;
}
