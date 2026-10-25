export const categories = ['All', 'Coffee', 'Tea', 'Breakfast', 'Main Meals', 'Snacks', 'Desserts'];

// Preview catalog; replace with the restaurant's API data when available.
export const menuItems = [
  { id: 15, name: 'Crispy Chicken Sandwich', description: 'Crispy chicken served in a sandwich', price: 4.50, category: 'Snacks', image: '/images/menu/crispy-chicken-sandwich.png' },
  { id: 16, name: 'Grilled Steak Salmon With Fries', description: 'Grilled salmon steak served with fries', price: 12.00, category: 'Main Meals', image: '/images/menu/grilled-steak-salmon-with-fries.png' },
  { id: 17, name: 'Beef Stew With Baguette', description: 'Beef stew served with a baguette', price: 6.50, category: 'Main Meals', image: '/images/menu/beef-stew-with-baguette.png' },
  { id: 18, name: 'LokLak Pizza', description: 'Pizza with LokLak-inspired toppings', price: 6.90, category: 'Main Meals', image: '/images/menu/loklak-pizza.png' },
  { id: 19, name: 'Hot Cappuccino', description: 'Hot espresso with steamed milk and foam', price: 2.95, category: 'Coffee', image: '/images/menu/hot-cappuccino.png' },
  { id: 20, name: 'Shrimp Paste Fried Rice', description: 'Fried rice seasoned with shrimp paste', price: 4.50, category: 'Main Meals', image: '/images/menu/shrimp-paste-fried-rice.png' },
  { id: 10, name: 'Crispy Prawns with Tamarind Glaze', description: 'Crispy prawns with tamarind glaze', price: 4.25, category: 'Main Meals', image: '/images/menu/crispy-prawns-tamarind-glaze.png' },
  { id: 11, name: 'Pork Belly With Kimchi', description: 'Pork belly served with kimchi', price: 4.25, category: 'Main Meals', image: '/images/menu/pork-belly-kimchi.png' },
  { id: 12, name: 'Iced Matcha Latte', description: 'Matcha latte served over ice', price: 2.95, category: 'Tea', image: '/images/menu/iced-matcha-latte.png' },
  { id: 13, name: 'Matcha Coconut Smoothie (M)', description: 'Medium matcha and coconut smoothie', price: 3.55, category: 'Tea', image: '/images/menu/matcha-coconut-smoothie.png' },
  { id: 14, name: 'Hot Matcha Latte (M)', description: 'Medium matcha latte served hot', price: 2.95, category: 'Tea', image: '/images/menu/hot-matcha-latte.png' },
  { id: 9, name: 'Classic Crispy Chicken Burger', description: 'Crispy chicken burger in a sesame bun, served with slaw', price: 4.80, category: 'Main Meals', image: '/images/menu/classic-crispy-chicken-burger.png' },
  { id: 7, name: 'Creamy Salmon Pasta Alfredo', description: 'Salmon pasta with a creamy Alfredo sauce', price: 7.25, category: 'Main Meals', image: '/images/menu/creamy-salmon-pasta-alfredo.png' },
  { id: 8, name: 'Khmer Spiced Stir Fried Seafood with Rice', description: 'Khmer-spiced seafood served with rice', price: 7.25, category: 'Main Meals', image: '/images/menu/khmer-spiced-seafood-rice.png' },
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
