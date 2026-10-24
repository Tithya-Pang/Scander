
import { useState } from 'react';
import Icon from '../../components/common/Icon';
import CategoryForm from '../../components/admin/CategoryForm';
import { useAdminMenu } from '../../context/AdminMenuContext';

const tones = ['green', 'amber', 'blue', 'purple'];

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

  const categoriesWithItems = categories.filter(category =>
    items.some(item => item.category === category.name)
  ).length;

  function closeForm() {
    setEditingCategory(null);
    setShowForm(false);
  }

  function handleSave(name) {
    const saved = saveCategory(
      name,
      editingCategory?.id ?? null
    );

    if (!saved) {
      alert('A category with this name already exists.');
      return;
    }

    closeForm();
  }

  function handleDelete(category) {
    const hasItems = items.some(
      item => item.category === category.name
    );

    if (hasItems) {
      alert(
        `Move or delete the menu items in "${category.name}" first.`
      );
      return;
    }

    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    deleteCategory(category.id);
  }

  return (
    <section className="a-catalog-page">
      <header className="a-catalog-heading">
        <div>
          <span className="eyebrow">MENU ORGANIZATION</span>
          <h1>Category Management</h1>
          <p>
            Organize your restaurant's food and drinks into categories.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary a-catalog-add"
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
        >
          <Icon name="plus" size={18} />
          Add Category
        </button>
      </header>

      <div className="a-catalog-stats">
        <div className="a-catalog-stat a-catalog-stat-slate">
          <span>Total Categories</span>
          <strong>{categories.length}</strong>
          <small>Menu organization</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-green">
          <span>Categories in Use</span>
          <strong>{categoriesWithItems}</strong>
          <small>Contain menu items</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-amber">
          <span>Empty Categories</span>
          <strong>{categories.length - categoriesWithItems}</strong>
          <small>No menu items yet</small>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          key={editingCategory?.id ?? 'new'}
          category={editingCategory}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      <section className="card a-catalog-panel">
        <div className="a-catalog-panel-heading">
          <div>
            <h2>Menu Categories</h2>
            <p>{filteredCategories.length} categories found</p>
          </div>
          <span className="a-catalog-demo">
            <Icon name="file" size={15} />
            Browser demo data
          </span>
        </div>

        <div className="a-catalog-filters">
          <label className="a-catalog-search">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search categories"
            />
          </label>

          {search && (
            <button
              type="button"
              className="a-catalog-reset"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <Icon name="refresh" size={19} />
            </button>
          )}
        </div>

        <div className="a-category-grid">
          {filteredCategories.map((category, index) => {
            const categoryItems = items.filter(
              item => item.category === category.name
            );

            const tone = tones[index % tones.length];

            return (
              <article className="a-category-card" key={category.id}>
                <div className="a-category-card-top">
                  <span className={`a-category-icon a-tone-${tone}`}>
                    <Icon name="utensils" size={23} />
                  </span>

                  <span className="a-category-count">
                    {categoryItems.length} items
                  </span>
                </div>

                <h3>{category.name}</h3>

                <p>
                  {categoryItems.length === 0
                    ? 'No menu items added yet'
                    : `${categoryItems.filter(item =>
                        item.availability
                      ).length} currently available`}
                </p>

                <div className="a-category-actions">
                  <button
                    type="button"
                    className="a-catalog-edit"
                    onClick={() => {
                      setEditingCategory(category);
                      setShowForm(true);
                    }}
                  >
                    <Icon name="pencil" size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="a-catalog-delete"
                    onClick={() => handleDelete(category)}
                    disabled={categoryItems.length > 0}
                    title={
                      categoryItems.length > 0
                        ? 'Move or delete menu items before deleting this category'
                        : 'Delete category'
                    }
                  >
                    <Icon name="trash" size={15} />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}

          {filteredCategories.length === 0 && (
            <p className="a-category-empty">
              No categories match your search.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
