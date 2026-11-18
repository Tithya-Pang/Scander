import { useEffect, useRef, useState } from 'react';

import Icon from '../../components/common/Icon';
import CategoryForm from '../../components/admin/CategoryForm';

import {
  getCategories,
  getMenuItems,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/adminMenuService';

const tones = ['green', 'amber', 'blue', 'purple'];

// ==========================================
// CATEGORY IMAGE COMPONENT
// ==========================================

function CategoryPreview({ image, name, tone }) {
  const [imageError, setImageError] = useState(false);

  return (
    <span className={`a-category-icon a-tone-${tone}`}>
      {image && !imageError ? (
        <img
          src={image}
          alt={`${name} category`}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <Icon name="utensils" size={23} />
      )}
    </span>
  );
}

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

export default function CategoryManagement() {
  // Database data
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // Loading
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Search
  const [search, setSearch] = useState('');

  // Add / Edit
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete
  const [deletingCategoryId, setDeletingCategoryId] =
    useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Prevent duplicate operations
  const operationLock = useRef(false);

  // ==========================================
  // LOAD DATA FROM BACKEND
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setLoadError('');

      try {
        const [dbCategories, dbItems] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        if (
          !Array.isArray(dbCategories) ||
          !Array.isArray(dbItems)
        ) {
          throw new Error('Unexpected API response.');
        }

        // Active categories
        const activeCategories = dbCategories
          .filter(category => category.is_active === true)
          .map(category => ({
            id: category.category_id,
            name: category.name,
            description: category.description || '',
            displayOrder: category.display_order ?? 0,
          }))
          .sort(
            (a, b) =>
              a.displayOrder - b.displayOrder ||
              a.id - b.id
          );

        // Active menu items, including their images
        const activeItems = dbItems
          .filter(item => item.is_active === true)
          .map(item => ({
            id: item.item_id,
            categoryId: item.category_id,
            availability: item.is_available === true,
            image: item.image_url || null,
          }));

        if (!cancelled) {
          setCategories(activeCategories);
          setItems(activeItems);
          setLoadError('');
        }
      } catch (error) {
        console.error('Failed to load categories:', error);

        if (!cancelled) {
          setLoadError(
            error.message || 'Unable to load categories.'
          );
          setCategories([]);
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ==========================================
  // CATEGORY STATISTICS
  // ==========================================

  const filteredCategories = categories.filter(category =>
    category.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function getCategoryItems(categoryId) {
    return items.filter(
      item => item.categoryId === categoryId
    );
  }

  const categoriesWithItems = categories.filter(category =>
    items.some(item => item.categoryId === category.id)
  ).length;

  const emptyCategories =
    categories.length - categoriesWithItems;

  const actionBusy =
    loading ||
    saving ||
    deletingCategoryId !== null;

  // ==========================================
  // OPEN / CLOSE CATEGORY FORM
  // ==========================================

  function openCreateForm() {
    if (actionBusy) return;

    setEditingCategory(null);
    setSaveError('');
    setDeleteError('');
    setShowForm(true);
  }

  function openEditForm(category) {
    if (actionBusy) return;

    setEditingCategory(category);
    setSaveError('');
    setDeleteError('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving || operationLock.current) return;

    setEditingCategory(null);
    setSaveError('');
    setShowForm(false);
  }

  // ==========================================
  // CREATE / UPDATE CATEGORY
  // ==========================================

  async function handleSave(name) {
    if (actionBusy || operationLock.current) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      setSaveError('Please enter a category name.');
      return;
    }

    if (trimmedName.length > 100) {
      setSaveError(
        'Category name must be 100 characters or fewer.'
      );
      return;
    }

    const duplicateCategory = categories.find(
      category =>
        category.name.toLowerCase() ===
          trimmedName.toLowerCase() &&
        category.id !== editingCategory?.id
    );

    if (duplicateCategory) {
      setSaveError(
        'A category with this name already exists.'
      );
      return;
    }

    operationLock.current = true;
    setSaving(true);
    setSaveError('');

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          name: trimmedName,
        });
      } else {
        // Create new category
        await createCategory({
          name: trimmedName,
        });
      }

      setShowForm(false);
      setEditingCategory(null);
      setSaveError('');

      // Reload current database data
      setRefreshKey(previous => previous + 1);
    } catch (error) {
      console.error('Failed to save category:', error);

      setSaveError(
        error.message || 'Unable to save category.'
      );
    } finally {
      operationLock.current = false;
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  async function handleDelete(category) {
    if (actionBusy || operationLock.current) return;

    const categoryItems = getCategoryItems(category.id);

    // Prevent deleting a category with active items
    if (categoryItems.length > 0) {
      setDeleteError(
        `Move or delete the menu items in "${category.name}" first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${category.name}"?\n\n` +
      'This category will be removed from the active menu.'
    );

    if (!confirmed) return;

    operationLock.current = true;
    setDeletingCategoryId(category.id);
    setDeleteError('');

    try {
      await deleteCategory(category.id);

      // Refresh database categories
      setRefreshKey(previous => previous + 1);
    } catch (error) {
      console.error('Failed to delete category:', error);

      setDeleteError(
        error.message || 'Unable to delete category.'
      );
    } finally {
      operationLock.current = false;
      setDeletingCategoryId(null);
    }
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <section className="a-catalog-page">

      {/* PAGE HEADING */}
      <header className="a-catalog-heading">
        <div>
          <span className="eyebrow">
            MENU ORGANIZATION
          </span>

          <h1>Category Management</h1>

          <p>
            Organize your restaurant's food and drinks
            into categories.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary a-catalog-add"
          onClick={openCreateForm}
          disabled={actionBusy || !!loadError}
        >
          <Icon name="plus" size={18} />
          Add Category
        </button>
      </header>

      {/* CATEGORY STATISTICS */}
      <div className="a-catalog-stats">

        <div className="a-catalog-stat a-catalog-stat-slate">
          <span>Total Categories</span>
          <strong>
            {loading
              ? '...'
              : loadError
                ? '—'
                : categories.length}
          </strong>
          <small>Menu organization</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-green">
          <span>Categories in Use</span>
          <strong>
            {loading
              ? '...'
              : loadError
                ? '—'
                : categoriesWithItems}
          </strong>
          <small>Contain menu items</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-amber">
          <span>Empty Categories</span>
          <strong>
            {loading
              ? '...'
              : loadError
                ? '—'
                : emptyCategories}
          </strong>
          <small>No menu items yet</small>
        </div>

      </div>

      {/* LOADING MESSAGE */}
      {loading && (
        <p role="status" className="muted">
          Loading categories...
        </p>
      )}

      {/* LOAD ERROR */}
      {loadError && (
        <p role="alert" className="admin-image-error">
          {loadError}
        </p>
      )}

      {/* DELETE ERROR */}
      {deleteError && (
        <p role="alert" className="admin-image-error">
          {deleteError}
        </p>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <>
          <CategoryForm
            key={editingCategory?.id ?? 'new'}
            category={editingCategory}
            onSave={handleSave}
            onCancel={closeForm}
          />

          {saving && (
            <p role="status" className="muted">
              Saving category...
            </p>
          )}

          {saveError && (
            <p role="alert" className="admin-image-error">
              {saveError}
            </p>
          )}
        </>
      )}

      {/* CATEGORY LIST */}
      <section className="card a-catalog-panel">

        <div className="a-catalog-panel-heading">
          <div>
            <h2>Menu Categories</h2>
            <p>
              {filteredCategories.length} categories found
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="a-catalog-filters">
          <label className="a-catalog-search">
            <Icon name="search" size={19} />

            <input
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
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

        {/* CATEGORY CARDS */}
        <div className="a-category-grid">

          {!loading &&
            !loadError &&
            filteredCategories.map((category, index) => {

              const categoryItems = getCategoryItems(
                category.id
              );

              // First item in this category with an image
              const previewImage = categoryItems.find(
                item => item.image
              )?.image || null;

              const availableItems = categoryItems.filter(
                item => item.availability
              ).length;

              const hasItems = categoryItems.length > 0;

              const tone = tones[index % tones.length];

              return (
                <article
                  className="a-category-card"
                  key={category.id}
                >

                  {/* CARD HEADER */}
                  <div className="a-category-card-top">

                    <CategoryPreview
                      key={`${category.id}-${previewImage || 'none'}`}
                      image={previewImage}
                      name={category.name}
                      tone={tone}
                    />

                    <span className="a-category-count">
                      {categoryItems.length} items
                    </span>

                  </div>

                  {/* CATEGORY NAME */}
                  <h3>{category.name}</h3>

                  {/* AVAILABILITY */}
                  <p>
                    {!hasItems
                      ? 'No menu items added yet'
                      : `${availableItems} currently available`}
                  </p>

                  {/* CATEGORY ACTIONS */}
                  <div className="a-category-actions">

                    {/* EDIT */}
                    <button
                      type="button"
                      className="a-catalog-edit"
                      disabled={actionBusy}
                      onClick={() =>
                        openEditForm(category)
                      }
                    >
                      <Icon name="pencil" size={15} />
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      className="a-catalog-delete"
                      disabled={actionBusy || hasItems}
                      onClick={() =>
                        handleDelete(category)
                      }
                      title={
                        hasItems
                          ? 'Move or delete menu items before deleting this category'
                          : 'Delete category'
                      }
                    >
                      <Icon name="trash" size={15} />

                      {deletingCategoryId === category.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>

                  </div>

                  {/* DELETE EXPLANATION */}
                  {hasItems && (
                    <small className="a-category-delete-hint">
                      Remove or reassign items before deleting.
                    </small>
                  )}

                </article>
              );
            })}

          {/* EMPTY STATE */}
          {!loading &&
            !loadError &&
            filteredCategories.length === 0 && (
              <p className="a-category-empty">
                {search
                  ? 'No categories match your search.'
                  : 'No categories yet. Add your first category.'}
              </p>
            )}

        </div>
      </section>
    </section>
  );
}
