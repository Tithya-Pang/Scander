import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import GGLayout from "../components/layout/GGLayout";

import Home from "../pages/landing/Home";
import About from "../pages/landing/About";
import HowItWorks from "../pages/landing/HowItWorks";
import PublicMenu from "../pages/landing/Menu";
import Contact from "../pages/landing/Contact";
import PageLayout from '../components/layout/PageLayout';
import CustomerMenu from '../pages/customer/Menu';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderTracking from '../pages/customer/OrderTracking';
import CustomerLayout from '../components/layout/CustomerLayout';
import KitchenDashboard from '../pages/kitchen/KitchenDashboard';
import OrderHistory from '../pages/kitchen/OrderHistory';
import KitchenOrderDetails from '../pages/kitchen/KitchenOrderDetails';
import KitchenSettings from '../pages/kitchen/KitchenSettings';
import KitchenLayout from '../components/layout/KitchenLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import MenuManagement from '../pages/admin/MenuManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';
import TableManagement from '../pages/admin/TableManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import AdminLayout from '../components/layout/AdminLayout';
import Reports from '../pages/admin/Reports';
import AdminSettings from '../pages/admin/AdminSettings';
import { AdminMenuProvider } from '../context/AdminMenuContext';
import Placeholder from '../components/common/Placeholder';
import Login from '../pages/auth/Login';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function CustomerRedirect({ to }) {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: to, search, hash }} replace />;
}

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
    <Route element={<GGLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/menu" element={<PublicMenu />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />
    </Route>
    <Route element={<CustomerLayout/>}>
      <Route path="/customer/menu" element={<CustomerMenu/>}/>
      <Route path="/customer/cart" element={<Cart/>}/>
      <Route path="/customer/checkout" element={<Checkout/>}/>
      <Route path="/customer/orders" element={<OrderTracking/>}/>
    </Route>
    <Route element={<ProtectedRoute allowedRole="KITCHEN_STAFF" />}>
    <Route element={<KitchenLayout/>}>
      <Route path="/kitchen" element={<KitchenDashboard/>}/>
      <Route path="/kitchen/history" element={<OrderHistory/>}/>
      <Route path="/kitchen/history/:orderId" element={<KitchenOrderDetails/>}/>
      <Route path="/kitchen/settings" element={<KitchenSettings/>}/>
    </Route>
    </Route>
    <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
    <Route element={<AdminMenuProvider>
      <AdminLayout />
    </AdminMenuProvider>}>
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="/admin/menu" element={<MenuManagement />} />
      <Route path="/admin/categories" element={<CategoryManagement />}/>
      <Route path="/admin/orders" element={<OrderManagement />}/>
      <Route path="/admin/tables" element={<TableManagement />}/>
      <Route path="/admin/payments" element={<PaymentManagement />}/>
      <Route path="/admin/reports" element={<Reports />}/>
      <Route path="/admin/settings" element={<AdminSettings/>}/>
    </Route>
    </Route>
    <Route path="/login" element={<Login/>}/>
    <Route path="/cart" element={<CustomerRedirect to="/customer/cart"/>}/>
    <Route path="/orders" element={<CustomerRedirect to="/customer/orders"/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
