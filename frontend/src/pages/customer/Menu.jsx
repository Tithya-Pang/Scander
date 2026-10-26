import { useEffect, useState } from 'react';
import MenuCard from '../../components/customer/MenuCard';
import Icon from '../../components/common/Icon';
import { useCart } from '../../context/CartContext';
import { filterMenu } from '../../data/menu';
import { getMenu } from '../../services/orders';

export default function Menu() {
  const [category, setCategory] = useState('All');
  const [menu, setMenu] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    getMenu({ signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) { setMenu(data); setCategory('All'); }
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);
  const categories = ['All', ...menu.categories.map(item => item.name)];
  const menuItems = menu.items;
  const [search, setSearch] = useState('');
  const { addItem } = useCart();
  const visibleItems = filterMenu(menuItems, category, search);
  return <section className="customer-menu">
    <header className="menu-heading"><div><span className="eyebrow">GATHER GROUNDS</span><h1>Explore our menu</h1><p>Fresh ingredients. Great coffee. A little more goodness in your day.</p></div><p className="menu-motto">Good Food<br/>Brighter Days</p></header>
    <div className="menu-search"><Icon name="search" size={24}/><input type="search" aria-label="Search menu" placeholder="Search for coffee, food, or something delicious..." value={search} onChange={event => setSearch(event.target.value)}/></div>
    <div className="menu-categories" role="group" aria-label="Menu categories">{categories.map(name => <button key={name} aria-pressed={category === name} className={category === name ? 'selected' : ''} onClick={() => setCategory(name)}>{name}</button>)}</div>
    {loading ? <p role="status" className="menu-no-results">Loading the menu…</p> : error ? <div className="card" role="alert"><h2>We couldn’t load the menu</h2><p>{error}</p><button className="btn btn-primary" onClick={() => setReload(value => value + 1)}>Try again</button></div> : visibleItems.length ? <div className="menu-grid">{visibleItems.map(item => <MenuCard key={item.id} item={item} onAdd={addItem}/>)}</div> : <div className="menu-no-results"><h2>No items found</h2><p>Try another category or search.</p><button className="btn btn-outline" onClick={() => { setCategory('All'); setSearch(''); }}>Show all items</button></div>}
  </section>;
}
