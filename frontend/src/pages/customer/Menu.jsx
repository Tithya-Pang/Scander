import { useState } from 'react';
import MenuCard from '../../components/customer/MenuCard';
import Icon from '../../components/common/Icon';
import { useCart } from '../../context/CartContext';
import { categories, menuItems, filterMenu } from '../../data/menu';

export default function Menu() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { addItem } = useCart();
  const visibleItems = filterMenu(menuItems, category, search);
  return <section className="customer-menu">
    <header className="menu-heading"><div><span className="eyebrow">GATHER GROUNDS</span><h1>Explore our menu</h1><p>Fresh ingredients. Great coffee. A little more goodness in your day.</p></div><p className="menu-motto">Good Food<br/>Brighter Days</p></header>
    <div className="menu-search"><Icon name="search" size={24}/><input type="search" aria-label="Search menu" placeholder="Search for coffee, food, or something delicious..." value={search} onChange={event => setSearch(event.target.value)}/></div>
    <div className="menu-categories" role="group" aria-label="Menu categories">{categories.map(name => <button key={name} aria-pressed={category === name} className={category === name ? 'selected' : ''} onClick={() => setCategory(name)}>{name}</button>)}</div>
    {visibleItems.length ? <div className="menu-grid">{visibleItems.map(item => <MenuCard key={item.id} item={item} onAdd={addItem}/>)}</div> : <div className="menu-no-results"><h2>No items found</h2><p>Try another category or search.</p><button className="btn btn-outline" onClick={() => { setCategory('All'); setSearch(''); }}>Show all items</button></div>}
  </section>;
}
