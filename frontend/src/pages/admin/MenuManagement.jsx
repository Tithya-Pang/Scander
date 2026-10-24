
import { useState } from 'react';
import MenuForm from '../../components/admin/MenuForm';
import { useAdminMenu } from '../../context/AdminMenuContext';

export default function MenuManagement() {
  const {
  items,
  categories: sharedCategories,
  saveItem,
  deleteItem,
  toggleItemAvailability
} = useAdminMenu();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const categories = sharedCategories.map(category => category.name);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      category === 'All' || item.category === category;

    return matchesSearch && matchesCategory;
  });

    function handleSave(formData) {
    saveItem(formData, editingItem?.id ?? null);

    setShowForm(false);
    setEditingItem(null);
    }

  function handleEdit(item) {
    setEditingItem(item);
    setShowForm(true);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
        'Are you sure you want to delete this menu item?'
    );

    if (!confirmed) return;

    deleteItem(id);
    }

  function toggleAvailability(id) {
  toggleItemAvailability(id);
}

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  return (
    <section className="admin-menu">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">MENU MANAGEMENT</span>
          <h1>Menu Items</h1>
          <p className="muted">
            Manage your restaurant's food and drinks.
          </p>
          <p className="muted">
            Demo mode — changes reset when the page reloads.
          </p>
        </div>

        <button
            className="btn btn-primary"
            disabled={categories.length === 0}
            onClick={() => {
                setEditingItem(null);
                setShowForm(true);
            }}
            >
            + Add Menu Item
        </button>
      </div>

      {showForm && (
        <MenuForm
          key={editingItem?.id ?? 'new'}
          item={editingItem}
          categories={categories}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      <div className="card">
        <div className="admin-menu-toolbar">
          <input
            type="search"
            placeholder="Search menu items..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className={`admin-availability ${
                        item.availability ? 'available' : 'soldout'
                      }`}
                      onClick={() => toggleAvailability(item.id)}
                    >
                      {item.availability ? 'Available' : 'Sold Out'}
                    </button>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="btn btn-outline btn-small"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-small admin-delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty">
                    No menu items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

