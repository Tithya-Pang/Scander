import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import CustomerMenu from '../pages/customer/Menu';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import CustomerLayout from '../components/layout/CustomerLayout';
import KitchenDashboard from '../pages/kitchen/KitchenDashboard';
import OrderHistory from '../pages/kitchen/OrderHistory';
import AdminDashboard from '../pages/admin/AdminDashboard';
import MenuManagement from '../pages/admin/MenuManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';
import TableManagement from '../pages/admin/TableManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import Reports from '../pages/admin/Reports';
import { AdminMenuProvider } from '../context/AdminMenuContext';
import Placeholder from '../components/common/Placeholder';
import Login from '../pages/auth/Login';

function Home() {
  const { search } = useLocation();
  return <main className="home"><span className="eyebrow">GATHER GROUNDS · SCANDER</span><h1>Restaurant ordering, made simple.</h1><p>Choose an interface to preview the frontend.</p><div className="home-links"><Link className="btn btn-primary" to={{ pathname: "/customer/menu", search }}>Customer</Link><Link className="btn btn-outline" to="/kitchen">Kitchen</Link><Link className="btn btn-outline" to="/admin">Admin</Link></div></main>;
}
function CustomerRedirect({ to }) {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: to, search, hash }} replace />;
}

const kitchenLinks = [['/kitchen','Dashboard'],['/kitchen/history','Order History'],['/kitchen/settings','Settings']];
const adminLinks = [
  ['/admin', 'Dashboard'],
  ['/admin/menu', 'Menu'],
  ['/admin/categories', 'Categories'],
  ['/admin/orders', 'Orders'],
  ['/admin/tables', 'Tables'],
  ['/admin/payments', 'Payments'],
  ['/admin/reports', 'Reports'],
  ['/admin/settings', 'Settings']
];

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route element={<CustomerLayout/>}>
      <Route path="/customer/menu" element={<CustomerMenu/>}/>
      <Route path="/customer/cart" element={<Cart/>}/>
      <Route path="/customer/checkout" element={<Checkout/>}/>
      <Route path="/customer/orders" element={<Placeholder title="Order Tracking"/>}/>
    </Route>
    <Route element={<PageLayout title="Kitchen" links={kitchenLinks}/> }>
      <Route path="/kitchen" element={<KitchenDashboard/>}/>
      <Route path="/kitchen/history" element={<OrderHistory/>}/>
      <Route path="/kitchen/settings" element={<Placeholder title="Kitchen Settings"/>}/>
    </Route>
    <Route element={<AdminMenuProvider>
      <PageLayout title="Admin" links={adminLinks} />
    </AdminMenuProvider>}>
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="/admin/menu" element={<MenuManagement />} />
      <Route path="/admin/categories" element={<CategoryManagement />}/>
      <Route path="/admin/orders" element={<OrderManagement />}/>
      <Route path="/admin/tables" element={<TableManagement />}/>
      <Route path="/admin/payments" element={<PaymentManagement />}/>
      <Route path="/admin/reports" element={<Reports />}/>
      <Route path="/admin/settings" element={<Placeholder title="Admin Settings"/>}/>
    </Route>
    <Route path="/login" element={<Login/>}/>
    <Route path="/menu" element={<CustomerRedirect to="/customer/menu"/>}/>
    <Route path="/cart" element={<CustomerRedirect to="/customer/cart"/>}/>
    <Route path="/orders" element={<CustomerRedirect to="/customer/orders"/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
