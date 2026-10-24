
import { useState } from 'react';

export default function MenuForm({
  item,
  categories,
  onSave,
  onCancel
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || categories[0] || '',
    price: item?.price ?? '',
    description: item?.description || ''
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const price = Number(form.price);

    if (!form.name.trim() || !Number.isFinite(price) || price <= 0) {
      alert('Please enter a valid name and price.');
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      price
    });
  }

  return (
    <div className="admin-form-card card">
      <h2>{item ? 'Edit Menu Item' : 'Add Menu Item'}</h2>

      <form onSubmit={handleSubmit} className="admin-item-form">

        <label htmlFor="item-name">Item Name</label>
        <input
          id="item-name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="item-category">Category</label>
        <select
          id="item-category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label htmlFor="item-price">Price ($)</label>
        <input
          id="item-price"
          type="number"
          name="price"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          required
        />

        <label htmlFor="item-description">Description</label>
        <textarea
          id="item-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
        />

        <div className="admin-form-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {item ? 'Save Changes' : 'Add Item'}
          </button>
        </div>

      </form>
    </div>
  );
}
