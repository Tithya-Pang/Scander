
import { useEffect, useState } from 'react';

import Icon from '../../components/common/Icon';
import MenuForm from '../../components/admin/MenuForm';

import {
  getMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem,
  uploadMenuImage,
} from '../../services/adminMenuService';

const money = amount => `$${Number(amount).toFixed(2)}`;

function MenuPhoto({ item }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="a-menu-photo">
      {item.image && !failed ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            objectPosition:
              item.imagePosition || 'center',
          }}
        />
      ) : (
        <Icon name="utensils" size={23} />
      )}
    </div>
  );
}

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [sharedCategories, setSharedCategories] = useState([]);

  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');

  const [deletingItemId, setDeletingItemId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // ==========================================
  // LOAD MENU DATA
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setMenuLoading(true);
      setMenuError('');

      try {
        const [dbItems, dbCategories] = await Promise.all([
          getMenuItems(),
          getCategories(),
        ]);

        if (
          !Array.isArray(dbItems) ||
          !Array.isArray(dbCategories)
        ) {
          throw new Error('Unexpected menu API response');
        }

        const activeCategories = dbCategories.filter(
          entry => entry.is_active === true
        );

        const categoryNames = new Map(
          activeCategories.map(entry => [
            entry.category_id,
            entry.name,
          ])
        );

        const mappedItems = dbItems
          .filter(item => item.is_active === true)
          .map(item => ({
            id: item.item_id,
            categoryId: item.category_id,
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            category:
              categoryNames.get(item.category_id) ||
              'Uncategorized',
            availability: item.is_available === true,
            image: item.image_url || '',
          }));

        if (!cancelled) {
          setItems(mappedItems);

          setSharedCategories(
            activeCategories.map(entry => ({
              id: entry.category_id,
              name: entry.name,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load menu:', error);

        if (!cancelled) {
          setItems([]);
          setSharedCategories([]);
          setMenuError('Unable to load menu items.');
        }
      } finally {
        if (!cancelled) {
          setMenuLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const categories = sharedCategories.map(
    entry => entry.name
  );

  const availableCount = items.filter(
    item => item.availability
  ).length;

  const soldOutCount = items.length - availableCount;

  const actionBusy =
    saving ||
    updatingItemId !== null ||
    deletingItemId !== null ||
    menuLoading;

  // ==========================================
  // FILTER MENU ITEMS
  // ==========================================

  const filteredItems = items.filter(item => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      (item.description || '')
        .toLowerCase()
        .includes(query);

    const matchesCategory =
      category === 'All' ||
      item.category === category;

    const matchesAvailability =
      availability === 'all' ||
      (
        availability === 'available' &&
        item.availability
      ) ||
      (
        availability === 'soldout' &&
        !item.availability
      );

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAvailability
    );
  });

  // ==========================================
  // CREATE / EDIT WITH IMAGE UPLOAD
  // ==========================================

  async function handleSave(formData) {
    if (actionBusy) return;

    setSaving(true);
    setSaveError('');

    try {
      const selectedCategory = sharedCategories.find(
        entry => entry.name === formData.category
      );

      if (!selectedCategory) {
        throw new Error('Please select a valid category.');
      }

      const price = Number(formData.price);

      if (
        !Number.isFinite(price) ||
        price <= 0 ||
        Math.abs(
          price * 100 - Math.round(price * 100)
        ) > 0.000001
      ) {
        throw new Error(
          'Please enter a valid price with up to 2 decimal places.'
        );
      }

      let imageUrl = formData.image || null;

      // Upload a newly selected file first.
      if (formData.imageFile) {
        imageUrl = await uploadMenuImage(
          formData.imageFile
        );
      }

      const payload = {
        category_id: selectedCategory.id,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        price: Math.round(price * 100) / 100,
        image_url: imageUrl,
      };

      if (editingItem) {
        await updateMenuItem(
          editingItem.id,
          payload
        );
      } else {
        await createMenuItem({
          ...payload,
          is_available: true,
        });
      }

      setShowForm(false);
      setEditingItem(null);
      setSaveError('');

      setRefreshKey(previous => previous + 1);
    } catch (error) {
      console.error('Saving menu item failed:', error);

      setSaveError(
        error.message || 'Unable to save menu item.'
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // UPDATE AVAILABILITY
  // ==========================================

  async function handleToggleAvailability(item) {
    if (actionBusy) return;

    setUpdatingItemId(item.id);
    setAvailabilityError('');

    try {
      const newAvailability = !item.availability;

      await updateMenuItemAvailability(
        item.id,
        newAvailability
      );

      setItems(previous =>
        previous.map(existing =>
          existing.id === item.id
            ? {
                ...existing,
                availability: newAvailability,
              }
            : existing
        )
      );
    } catch (error) {
      console.error(
        'Failed to update availability:',
        error
      );

      setAvailabilityError(
        'Unable to update availability. Please try again.'
      );
    } finally {
      setUpdatingItemId(null);
    }
  }

  // ==========================================
  // SOFT DELETE
  // ==========================================

  async function handleDelete(item) {
    if (actionBusy) return;

    const confirmed = window.confirm(
      `Remove "${item.name}" from the menu?\n\n` +
      'Historical order records will be preserved.'
    );

    if (!confirmed) return;

    setDeletingItemId(item.id);
    setDeleteError('');

    try {
      await deleteMenuItem(item.id);

      setItems(previous =>
        previous.filter(
          existing => existing.id !== item.id
        )
      );

      if (editingItem?.id === item.id) {
        setEditingItem(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);

      setDeleteError(
        'Unable to delete the menu item.'
      );
    } finally {
      setDeletingItemId(null);
    }
  }

  // ==========================================
  // FORM CONTROLS
  // ==========================================

  function openCreateForm() {
    if (actionBusy) return;

    setEditingItem(null);
    setSaveError('');
    setShowForm(true);
  }

  function openEditForm(item) {
    if (actionBusy) return;

    setEditingItem(item);
    setSaveError('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setEditingItem(null);
    setSaveError('');
    setShowForm(false);
  }

  function resetFilters() {
    setSearch('');
    setCategory('All');
    setAvailability('all');
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <section className="a-catalog-page">
      <header className="a-catalog-heading">
        <div>
          <span className="eyebrow">
            MENU CATALOG
          </span>

          <h1>Menu Management</h1>

          <p>
            Keep your food and drink catalog
            organized and up to date.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary a-catalog-add"
          disabled={
            actionBusy ||
            !!menuError ||
            sharedCategories.length === 0
          }
          onClick={openCreateForm}
        >
          <Icon name="plus" size={18} />
          Add Menu Item
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <div className="a-catalog-stats">
        <div className="a-catalog-stat a-catalog-stat-slate">
          <span>Total Menu Items</span>
          <strong>
            {menuLoading
              ? '...'
              : menuError
                ? '—'
                : items.length}
          </strong>
          <small>Items in your catalog</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-green">
          <span>Available</span>
          <strong>
            {menuLoading
              ? '...'
              : menuError
                ? '—'
                : availableCount}
          </strong>
          <small>Ready for customers</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-amber">
          <span>Sold Out</span>
          <strong>
            {menuLoading
              ? '...'
              : menuError
                ? '—'
                : soldOutCount}
          </strong>
          <small>Currently unavailable</small>
        </div>
      </div>

      {/* MESSAGES */}
      {menuLoading && (
        <p role="status" className="muted">
          Loading menu items...
        </p>
      )}

      {menuError && (
        <p role="alert" className="muted">
          {menuError}
        </p>
      )}

      {availabilityError && (
        <p role="alert" className="admin-image-error">
          {availabilityError}
        </p>
      )}

      {deleteError && (
        <p role="alert" className="admin-image-error">
          {deleteError}
        </p>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <MenuForm
          key={editingItem?.id ?? 'new'}
          item={editingItem}
          categories={categories}
          onSave={handleSave}
          onCancel={closeForm}
          saving={saving}
          saveError={saveError}
        />
      )}

      {/* MENU CATALOG */}
      <section className="card a-catalog-panel">
        <div className="a-catalog-panel-heading">
          <div>
            <h2>All Menu Items</h2>
            <p>
              {filteredItems.length} matching items
            </p>
          </div>

          <span className="a-catalog-demo">
            <Icon name="file" size={15} />
            Supabase menu data
          </span>
        </div>

        {/* FILTERS */}
        <div className="a-catalog-filters">
          <label className="a-catalog-search">
            <Icon name="search" size={19} />

            <input
              type="search"
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="Search food or drinks..."
              aria-label="Search menu items"
            />
          </label>

          <select
            value={category}
            onChange={event =>
              setCategory(event.target.value)
            }
            aria-label="Filter by category"
          >
            <option value="All">
              All Categories
            </option>

            {categories.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={event =>
              setAvailability(event.target.value)
            }
            aria-label="Filter by availability"
          >
            <option value="all">
              All Availability
            </option>
            <option value="available">
              Available
            </option>
            <option value="soldout">
              Sold Out
            </option>
          </select>

          <button
            type="button"
            className="a-catalog-reset"
            title="Reset filters"
            aria-label="Reset filters"
            onClick={resetFilters}
          >
            <Icon name="refresh" size={19} />
          </button>
        </div>

        {/* MENU TABLE */}
        <div className="table-scroll">
          <table className="a-catalog-table">
            <thead>
              <tr>
                <th>MENU ITEM</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>AVAILABILITY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {!menuLoading &&
                !menuError &&
                filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="a-menu-product">
                        <MenuPhoto
                          key={`${item.id}-${item.image || ''}`}
                          item={item}
                        />

                        <div>
                          <strong>{item.name}</strong>

                          <small>
                            {item.description ||
                              'No description added'}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="a-catalog-category-badge">
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <strong className="a-catalog-price">
                        {money(item.price)}
                      </strong>
                    </td>

                    {/* AVAILABILITY */}
                    <td>
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() =>
                          handleToggleAvailability(item)
                        }
                        className={`a-catalog-availability ${
                          item.availability
                            ? 'is-available'
                            : 'is-soldout'
                        }`}
                        aria-label={`Mark ${item.name} ${
                          item.availability
                            ? 'sold out'
                            : 'available'
                        }`}
                      >
                        <span />

                        {updatingItemId === item.id
                          ? 'Updating...'
                          : item.availability
                            ? 'Available'
                            : 'Sold Out'}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="a-catalog-actions">
                        <button
                          type="button"
                          className="a-catalog-edit"
                          disabled={actionBusy}
                          onClick={() =>
                            openEditForm(item)
                          }
                        >
                          <Icon name="pencil" size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="a-catalog-delete"
                          disabled={actionBusy}
                          onClick={() =>
                            handleDelete(item)
                          }
                        >
                          <Icon name="trash" size={15} />

                          {deletingItemId === item.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!menuLoading &&
                !menuError &&
                filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="admin-empty"
                    >
                      No menu items match your filters.

                      <div>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={resetFilters}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
