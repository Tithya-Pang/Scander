import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [instructions, setInstructions] = useState('');
  function addItem(item) {
    setItems(current => current.some(entry => entry.id === item.id)
      ? current.map(entry => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry)
      : [...current, { ...item, quantity: 1 }]);
  }
  function changeQuantity(id, change) {
    setItems(current => current.map(item => item.id === id
      ? { ...item, quantity: item.quantity + change } : item).filter(item => item.quantity > 0));
  }
  function clearCart() { setItems([]); setInstructions(''); }
  const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  const taxCents = Math.round(subtotalCents * 0.08);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <CartContext.Provider value={{ items, instructions, setInstructions, addItem,
    changeQuantity, clearCart, count, subtotal: subtotalCents / 100,
    tax: taxCents / 100, total: (subtotalCents + taxCents) / 100 }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used inside CartProvider');
  return cart;
}
