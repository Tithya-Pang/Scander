import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from '../../context/CartContext';
import OrderPanel from '../customer/OrderPanel';
import Icon from '../common/Icon';

function CustomerShell() {
  const { search, pathname } = useLocation();
  const params = new URLSearchParams(search);
  const table = params.get('table') || params.get('tableId') || params.get('table_id');
  const { count } = useCart();
  const links = [['/customer/menu', 'menu', 'Menu'], ['/customer/cart', 'bag', 'Cart'], ['/customer/orders', 'clock', 'Order Status']];
  const showPanel = pathname === '/customer/menu';
  return <div className={`customer-shell${showPanel ? '' : ' customer-shell-no-panel'}`}>
    <aside className="customer-sidebar">
      <Link to={{ pathname: '/customer/menu', search }} className="customer-brand"><span className="coffee-mark"><Icon name="coffee" size={28}/></span><span><strong>Gather Grounds<span>.</span></strong><small>Dine-in Order</small></span></Link>
      <div className="table-card"><span className="table-icon"><Icon name="menu"/></span><div><span>YOUR TABLE</span><strong>{table ? `Table #${table}` : 'Scan your table QR'}{table === '12' && <span> (Main Dining)</span>}</strong></div></div>
      <nav aria-label="Customer navigation">{links.map(([to, icon, label]) => <NavLink key={to} to={{ pathname: to, search }} className={({ isActive }) => `customer-nav-link${isActive ? ' active' : ''}`}><Icon name={icon}/>{label}{label === 'Cart' && count > 0 && <span className="cart-count">{count}</span>}{label === 'Order Status' && <span className="status-dot"/>}</NavLink>)}</nav>
      <div className="customer-sidebar-footer"><p>“Good food brings people<br/>together.”</p><span/></div>
    </aside>
    <main className="customer-content"><Outlet/></main>
    {showPanel && <aside className="customer-order"><OrderPanel/></aside>}
  </div>;
}
export default function CustomerLayout() {
  return <CartProvider><CustomerShell/></CartProvider>;
}
