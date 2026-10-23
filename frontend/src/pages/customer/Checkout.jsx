import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
export default function Checkout() {
  const { total, count, instructions } = useCart();
  const { search } = useLocation();
  return <section className="checkout-preview"><span className="eyebrow">GATHER GROUNDS</span><h1>Review your order</h1><div className="card"><h2>{count ? `${count} items · $${total.toFixed(2)}` : 'Your cart is empty'}</h2>{instructions && <p>Kitchen instructions: {instructions}</p>}<p className="muted">Checkout preview. Order submission and payment are not connected yet.</p><Link className="btn btn-primary" to={{ pathname: '/customer/menu', search }}>Back to menu</Link></div></section>;
}
