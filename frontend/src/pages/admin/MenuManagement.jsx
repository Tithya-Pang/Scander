
import { useState } from 'react';
import Icon from '../../components/common/Icon';
import MenuForm from '../../components/admin/MenuForm';
import { useAdminMenu } from '../../context/AdminMenuContext';

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
            objectPosition: item.imagePosition || 'center'
          }}
        />
      ) : (
        <Icon name="utensils" size={23} />
      )}
    </div>
  );
}

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
  const [availability, setAvailability] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const categories = sharedCategories.map(entry => entry.name);
  const availableCount = items.filter(item => item.availability).length;
  const soldOutCount = items.length - availableCount;

  const filteredItems = items.filter(item => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query);

    const matchesCategory =
      category === 'All' || item.category === category;

    const matchesAvailability =
      availability === 'all' ||
      (availability === 'available' && item.availability) ||
      (availability === 'soldout' && !item.availability);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  function closeForm() {
    setEditingItem(null);
    setShowForm(false);
  }

  function handleSave(formData) {
    saveItem(formData, editingItem?.id ?? null);
    closeForm();
  }

  function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) {
      return;
    }

    deleteItem(item.id);
  }

  function resetFilters() {
    setSearch('');
    setCategory('All');
    setAvailability('all');
  }

  return (
    <section className="a-catalog-page">
      <header className="a-catalog-heading">
        <div>
          <span className="eyebrow">MENU CATALOG</span>
          <h1>Menu Management</h1>
          <p>
            Keep your food and drink catalog organized and up to date.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary a-catalog-add"
          disabled={categories.length === 0}
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          <Icon name="plus" size={18} />
          Add Menu Item
        </button>
      </header>

      <div className="a-catalog-stats">
        <div className="a-catalog-stat a-catalog-stat-slate">
          <span>Total Menu Items</span>
          <strong>{items.length}</strong>
          <small>Items in your catalog</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-green">
          <span>Available</span>
          <strong>{availableCount}</strong>
          <small>Ready for customers</small>
        </div>

        <div className="a-catalog-stat a-catalog-stat-amber">
          <span>Sold Out</span>
          <strong>{soldOutCount}</strong>
          <small>Currently unavailable</small>
        </div>
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

      <section className="card a-catalog-panel">
        <div className="a-catalog-panel-heading">
          <div>
            <h2>All Menu Items</h2>
            <p>{filteredItems.length} matching items</p>
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
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search food or drinks..."
              aria-label="Search menu items"
            />
          </label>

          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            {categories.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={availability}
            onChange={event => setAvailability(event.target.value)}
            aria-label="Filter by availability"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="soldout">Sold Out</option>
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
              {filteredItems.map(item => (
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
                          {item.description || 'No description added'}
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

                  <td>
                    <button
                      type="button"
                      className={`a-catalog-availability ${
                        item.availability ? 'is-available' : 'is-soldout'
                      }`}
                      onClick={() => toggleItemAvailability(item.id)}
                      aria-label={`Mark ${item.name} ${
                        item.availability ? 'sold out' : 'available'
                      }`}
                    >
                      <span />
                      {item.availability ? 'Available' : 'Sold Out'}
                    </button>
                  </td>

                  <td>
                    <div className="a-catalog-actions">
                      <button
                        type="button"
                        className="a-catalog-edit"
                        onClick={() => {
                          setEditingItem(item);
                          setShowForm(true);
                        }}
                      >
                        <Icon name="pencil" size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="a-catalog-delete"
                        onClick={() => handleDelete(item)}
                      >
                        <Icon name="trash" size={15} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty">
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
