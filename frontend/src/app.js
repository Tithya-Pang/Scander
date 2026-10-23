import { Link, Navigate, Route, Routes } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import CustomerMenu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import OrderHistory from './pages/kitchen/OrderHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import Placeholder from './components/common/Placeholder';

function Home() {
  return <main className="home"><span className="eyebrow">WELCOME TO SCANDER</span><h1>Restaurant ordering, made simple.</h1><p>Choose an interface to preview the frontend.</p><div className="home-links"><Link className="btn btn-primary" to="/customer/menu">Customer</Link><Link className="btn btn-outline" to="/kitchen">Kitchen</Link><Link className="btn btn-outline" to="/admin">Admin</Link></div></main>;
}
const customerLinks = [['/customer/menu','Menu'],['/customer/cart','Cart'],['/customer/checkout','Checkout'],['/customer/orders','Track Order']];
const kitchenLinks = [['/kitchen','Dashboard'],['/kitchen/history','Order History'],['/kitchen/settings','Settings']];
const adminLinks = [['/admin','Dashboard'],['/admin/menu','Menu'],['/admin/orders','Orders'],['/admin/tables','Tables'],['/admin/reports','Reports'],['/admin/settings','Settings']];

export default function App() {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route element={<PageLayout title="Customer" links={customerLinks}/> }>
      <Route path="/customer/menu" element={<CustomerMenu/>}/>
      <Route path="/customer/cart" element={<Cart/>}/>
      <Route path="/customer/checkout" element={<Placeholder title="Checkout"/>}/>
      <Route path="/customer/orders" element={<Placeholder title="Order Tracking"/>}/>
    </Route>
    <Route element={<PageLayout title="Kitchen" links={kitchenLinks}/> }>
      <Route path="/kitchen" element={<KitchenDashboard/>}/>
      <Route path="/kitchen/history" element={<OrderHistory/>}/>
      <Route path="/kitchen/settings" element={<Placeholder title="Kitchen Settings"/>}/>
    </Route>
    <Route element={<PageLayout title="Admin" links={adminLinks}/> }>
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="/admin/menu" element={<Placeholder title="Menu Management"/>}/>
      <Route path="/admin/orders" element={<Placeholder title="Order Management"/>}/>
      <Route path="/admin/tables" element={<Placeholder title="Table Management"/>}/>
      <Route path="/admin/reports" element={<Placeholder title="Reports"/>}/>
      <Route path="/admin/settings" element={<Placeholder title="Admin Settings"/>}/>
    </Route>
    <Route path="/login" element={<Placeholder title="Staff Login"/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
