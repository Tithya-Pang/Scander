import { useState } from 'react';
import CategoryForm from '../../components/admin/CategoryForm';
import { useAdminMenu } from '../../context/AdminMenuContext';

export default function CategoryManagement() {
const {
  categories,
  items,
  saveCategory,
  deleteCategory
} = useAdminMenu();
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function handleAdd() {
    setEditingCategory(null);
    setShowForm(true);
  }

  function handleEdit(category) {
    setEditingCategory(category);
    setShowForm(true);
  }

  function handleSave(name) {
  const saved = saveCategory(
    name,
    editingCategory?.id ?? null
  );

  if (!saved) {
    alert('Invalid or duplicate category name.');
    return;
  }

  handleCancel();
}

  function handleDelete(category) {
  const hasItems = items.some(
    item => item.category === category.name
  );

  if (hasItems) {
    alert(
      'This category contains menu items. Move or delete its items first.'
    );
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${category.name}"?`
  );

  if (!confirmed) return;

  deleteCategory(category.id);
}

  function handleCancel() {
    setShowForm(false);
    setEditingCategory(null);
  }

  return (
    <section className="admin-categories">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">MENU MANAGEMENT</span>
          <h1>Categories</h1>
          <p className="muted">
            Organize your restaurant menu into categories.
          </p>
          <p className="muted">
            Demo mode — changes reset when the page reloads.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAdd}
        >
          + Add Category
        </button>
      </div>

      {showForm && (
        <CategoryForm
          key={editingCategory?.id ?? 'new'}
          category={editingCategory}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="card">
        <div className="admin-menu-toolbar">
          <input
            type="search"
            placeholder="Search categories..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Menu Items</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map(category => {
                const itemCount = items.filter(
                item => item.category === category.name
                ).length;

                return (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>

                    <td>{itemCount} items</td>

                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="btn btn-outline btn-small"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-small admin-delete-btn"
                          onClick={() => handleDelete(category)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="3" className="admin-empty">
                    No categories found.
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
