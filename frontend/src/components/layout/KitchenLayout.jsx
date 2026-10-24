import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { KitchenProvider, useKitchen } from '../../context/KitchenContext';
import Icon from '../common/Icon';

const links = [['/kitchen', 'utensils', 'Kitchen Queue', true], ['/kitchen/history', 'clock', 'Order History', false], ['/kitchen/settings', 'settings', 'Settings', true]];

function KitchenShell() {
  const { settings, toasts, dismissToast } = useKitchen();
  const navigate = useNavigate();
  const { name, email } = settings.profile;
  return <div className="kitchen-shell" data-theme={settings.theme}>
    <aside className="k-sidebar">
      <Link to="/kitchen" className="k-brand"><span className="k-brand-mark"><Icon name="coffee" size={28}/></span><span><strong>Gather Grounds<span>.</span></strong><small>Kitchen Staff</small></span></Link>
      <nav aria-label="Kitchen navigation">{links.map(([to, icon, label, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `k-nav-link${isActive ? ' active' : ''}`}><Icon name={icon}/>{label}</NavLink>)}</nav>
      <div className="k-sidebar-footer">
        <div className="k-profile"><span className="k-avatar"><Icon name="user" size={20}/></span><span><strong>{name}</strong><small>{email}</small></span></div>
        <button type="button" className="k-logout" onClick={() => navigate('/login')}><Icon name="logout" size={20}/>Log out</button>
      </div>
    </aside>
    <main className="k-content"><Outlet/></main>
    <div className="k-toasts" role="status" aria-live="polite">{toasts.map(toast => <div key={toast.id} className={`k-toast k-toast-${toast.tone}`}>
      <Icon name={toast.tone === 'success' ? 'checkCircle' : 'bell'} size={18}/><span>{toast.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={() => dismissToast(toast.id)}>×</button>
    </div>)}</div>
  </div>;
}

export default function KitchenLayout() {
  return <KitchenProvider><KitchenShell/></KitchenProvider>;
}
