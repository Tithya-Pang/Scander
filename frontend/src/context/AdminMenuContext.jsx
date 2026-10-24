
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  categories as sampleCategories,
  menuItems as sampleMenuItems
} from '../data/menu';

const AdminMenuContext = createContext(null);
const STORAGE_KEY = 'scander-admin-menu-demo-v1';

function createInitialData() {
  return {
    categories: sampleCategories
      .filter(name => name !== 'All')
      .map(name => ({
        id: crypto.randomUUID(),
        name
      })),

    items: sampleMenuItems.map(item => ({
      ...item,
      availability: item.availability ?? true
    }))
  };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed.categories) &&
        Array.isArray(parsed.items)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Unable to load demo menu data:', error);
  }

  return createInitialData();
}

export function AdminMenuProvider({ children }) {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Unable to save demo menu data:', error);
    }
  }, [data]);

  function saveItem(formData, editingId = null) {
    setData(previous => {
      if (editingId !== null) {
        return {
          ...previous,
          items: previous.items.map(item =>
            item.id === editingId
              ? { ...item, ...formData }
              : item
          )
        };
      }

      return {
        ...previous,
        items: [
          ...previous.items,
          {
            ...formData,
            id: crypto.randomUUID(),
            availability: true,
            image: ''
          }
        ]
      };
    });
  }

  function deleteItem(id) {
    setData(previous => ({
      ...previous,
      items: previous.items.filter(item => item.id !== id)
    }));
  }

  function toggleItemAvailability(id) {
    setData(previous => ({
      ...previous,
      items: previous.items.map(item =>
        item.id === id
          ? { ...item, availability: !item.availability }
          : item
      )
    }));
  }

  function saveCategory(name, editingId = null) {
    const cleanName = name.trim();

    if (!cleanName) return false;

    const duplicate = data.categories.some(category =>
      category.name.toLowerCase() === cleanName.toLowerCase() &&
      category.id !== editingId
    );

    if (duplicate) return false;

    setData(previous => {
      if (editingId !== null) {
        const oldCategory = previous.categories.find(
          category => category.id === editingId
        );

        if (!oldCategory) return previous;

        return {
          categories: previous.categories.map(category =>
            category.id === editingId
              ? { ...category, name: cleanName }
              : category
          ),
          items: previous.items.map(item =>
            item.category === oldCategory.name
              ? { ...item, category: cleanName }
              : item
          )
        };
      }

      return {
        ...previous,
        categories: [
          ...previous.categories,
          {
            id: crypto.randomUUID(),
            name: cleanName
          }
        ]
      };
    });

    return true;
  }

  function deleteCategory(id) {
    const category = data.categories.find(
      category => category.id === id
    );

    if (!category) return false;

    const hasItems = data.items.some(
      item => item.category === category.name
    );

    if (hasItems) return false;

    setData(previous => ({
      ...previous,
      categories: previous.categories.filter(
        category => category.id !== id
      )
    }));

    return true;
  }

  return (
    <AdminMenuContext.Provider value={{
      categories: data.categories,
      items: data.items,
      saveItem,
      deleteItem,
      toggleItemAvailability,
      saveCategory,
      deleteCategory
    }}>
      {children}
    </AdminMenuContext.Provider>
  );
}

export function useAdminMenu() {
  const context = useContext(AdminMenuContext);

  if (!context) {
    throw new Error(
      'useAdminMenu must be used inside AdminMenuProvider'
    );
  }

  return context;
}
