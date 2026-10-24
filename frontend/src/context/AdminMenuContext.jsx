
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  categories as sampleCategories,
  menuItems as sampleMenuItems
} from '../data/menu';

const AdminMenuContext = createContext(null);

const STORAGE_KEY = 'scander-admin-menu-demo-v1';

// Convert the sample categories into editable records.
const initialCategories = sampleCategories
  .filter(category => category !== 'All')
  .map((category, index) => ({
    id: index + 1,
    name: category
  }));

const initialItems = sampleMenuItems.map(item => ({
  ...item,
  availability: item.availability !== false,
  image: item.image || ''
}));

function initialData() {
  return {
    categories: initialCategories,
    items: initialItems
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return initialData();
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !Array.isArray(parsed.items) ||
      !Array.isArray(parsed.categories)
    ) {
      return initialData();
    }

    return {
      items: parsed.items.map(item => ({
        ...item,
        availability: item.availability !== false,
        image: item.image || ''
      })),
      categories: parsed.categories
        .map((category, index) =>
          typeof category === 'string'
            ? { id: index + 1, name: category }
            : category
        )
        .filter(category => category?.name)
    };
  } catch (error) {
    console.warn('Could not load saved menu:', error);
    return initialData();
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AdminMenuProvider({ children }) {
  const [data, setData] = useState(loadData);

  const [storageError, setStorageError] = useState('');

  // Save changes so they survive a browser refresh.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageError('');
    } catch (error) {
      console.warn('Could not save menu data:', error);
      setStorageError(
        'Menu changes could not be saved in browser storage.'
      );
    }
  }, [data]);

  // ==========================================
  // MENU ITEM FUNCTIONS
  // ==========================================

  function saveItem(formData, editingId = null) {
    const cleaned = {
      ...formData,
      name: String(formData.name || '').trim(),
      description: String(formData.description || '').trim(),
      price: Number(formData.price),
      image: formData.image || ''
    };

    if (
      !cleaned.name ||
      !Number.isFinite(cleaned.price) ||
      cleaned.price <= 0
    ) {
      return false;
    }

    setData(previous => {
      if (editingId !== null) {
        return {
          ...previous,
          items: previous.items.map(item =>
            item.id === editingId
              ? {
                  ...item,
                  ...cleaned,
                  // Editing should preserve current availability.
                  availability: item.availability
                }
              : item
          )
        };
      }

      const newItem = {
        ...cleaned,
        id: createId(),
        availability: true
      };

      return {
        ...previous,
        items: [...previous.items, newItem]
      };
    });

    return true;
  }

  function deleteItem(itemId) {
    setData(previous => ({
      ...previous,
      items: previous.items.filter(item => item.id !== itemId)
    }));
  }

  function toggleItemAvailability(itemId) {
    setData(previous => ({
      ...previous,
      items: previous.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              availability: !item.availability
            }
          : item
      )
    }));
  }

  // ==========================================
  // CATEGORY FUNCTIONS
  // ==========================================

  function saveCategory(name, editingId = null) {
    const cleanedName = String(name || '').trim();

    if (!cleanedName) return false;

    const duplicate = data.categories.some(category =>
      category.name.toLowerCase() === cleanedName.toLowerCase() &&
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
          ...previous,
          categories: previous.categories.map(category =>
            category.id === editingId
              ? { ...category, name: cleanedName }
              : category
          ),
          items: previous.items.map(item =>
            item.category === oldCategory.name
              ? { ...item, category: cleanedName }
              : item
          )
        };
      }

      return {
        ...previous,
        categories: [
          ...previous.categories,
          {
            id: createId(),
            name: cleanedName
          }
        ]
      };
    });

    return true;
  }

  function deleteCategory(categoryId) {
    const category = data.categories.find(
      entry => entry.id === categoryId
    );

    if (!category) return false;

    const hasItems = data.items.some(
      item => item.category === category.name
    );

    if (hasItems) return false;

    setData(previous => ({
      ...previous,
      categories: previous.categories.filter(
        entry => entry.id !== categoryId
      )
    }));

    return true;
  }

  // ==========================================
  // SHARED CONTEXT VALUE
  // ==========================================

  const value = useMemo(() => ({
    items: data.items,
    categories: data.categories,
    storageError,

    saveItem,
    deleteItem,
    toggleItemAvailability,

    saveCategory,
    deleteCategory
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, storageError]);

  return (
    <AdminMenuContext.Provider value={value}>
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
