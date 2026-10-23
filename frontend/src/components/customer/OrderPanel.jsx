import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Icon from '../common/Icon';

const money = value => `$${value.toFixed(2)}`;
export default function OrderPanel({ standalone = false }) {
  const { items, count, changeQuantity, clearCart, instructions, setInstructions, subtotal, tax, total } = useCart();
  const navigate = useNavigate();
  const { search } = useLocation();
  return <section className={`order-panel${standalone ? ' order-standalone' : ''}`} aria-labelledby={standalone ? 'cart-heading' : 'order-heading'}>
    <header className="order-header">
      <div><h2 id={standalone ? 'cart-heading' : 'order-heading'}>Your Order</h2><p>{count} {count === 1 ? 'item' : 'items'}</p></div>
      <button className="clear-order" onClick={clearCart} disabled={!count}><Icon name="trash" size={16}/> Clear all</button>
    </header>
    <div className="order-items" aria-live="polite">
      {items.length === 0 ? <div className="order-empty"><span className="empty-cart-icon"><Icon name="cart" size={38}/></span><h3>Your cart is empty</h3><p>Select items from the menu to start<br/>your dine-in order.</p></div> :
        items.map(item => <article className="order-line" key={item.id}>
          <img src={item.image} alt=""/><div><h3>{item.name}</h3><p>{money(item.price)}</p><div className="quantity-control"><button aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button aria-label={`Add one ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>+</button></div></div><strong>{money(item.price * item.quantity)}</strong>
        </article>)}
    </div>
    <div className="order-summary">
      <label className="instructions-label" htmlFor={standalone ? 'cart-instructions' : 'order-instructions'}><Icon name="note" size={17}/> Kitchen Instructions (Optional)</label>
      <textarea id={standalone ? 'cart-instructions' : 'order-instructions'} placeholder="e.g. Less ice, no onions..." value={instructions} onChange={event => setInstructions(event.target.value)} maxLength={500} rows={2}/>
      <dl className="order-totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Estimated Tax (8%)</dt><dd>{money(tax)}</dd></div><div className="order-total"><dt>Total</dt><dd>{money(total)}</dd></div></dl>
      <button className="checkout-button" disabled={!count} onClick={() => navigate({ pathname: '/customer/checkout', search })}><Icon name="lock" size={20}/> Proceed to Checkout</button>
      <p className="order-footer"><Icon name="leaf" size={17}/> Fresh food. Happier days.</p>
    </div>
  </section>;
}
