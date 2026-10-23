export const categories = ['All', 'Coffee', 'Tea', 'Breakfast', 'Main Meals', 'Snacks', 'Desserts'];

// Preview catalog; replace with the restaurant's API data when available.
export const menuItems = [
  { id: 1, name: 'Iced Latte', description: 'Espresso, milk and ice', price: 3.50, category: 'Coffee', image: '/images/menu/iced-latte.jpg', imagePosition: 'center 53%' },
  { id: 4, name: 'Cappuccino', description: 'Espresso, steamed milk and a smooth layer of foam', price: 3.75, category: 'Coffee', image: '/images/menu/cappuccino.jpg' },
  { id: 2, name: 'Chicken Sandwich', description: 'Grilled chicken and fresh vegetables', price: 5.25, category: 'Snacks', image: '/images/menu/chicken-sandwich.jpg' },
  { id: 5, name: 'Avocado Toast', description: 'Creamy avocado, toasted bread and a sunny-side-up egg', price: 4.75, category: 'Breakfast', image: '/images/menu/avocado-toast.jpg' },
  { id: 3, name: 'Fried Rice', description: 'House-style rice with vegetables', price: 4.50, category: 'Main Meals', image: '/images/menu/fried-rice.jpg', imagePosition: 'center 65%' },
  { id: 6, name: 'Chocolate Cake', description: 'Rich chocolate cake with a silky chocolate frosting', price: 4.25, category: 'Desserts', image: '/images/menu/chocolate-cake.jpg' },
];

export function filterMenu(items, category, search) {
  const query = search.trim().toLowerCase();
  return items.filter(item => (category === 'All' || item.category === category)
    && `${item.name} ${item.description}`.toLowerCase().includes(query));
}
