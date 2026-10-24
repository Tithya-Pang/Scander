
import { useState } from 'react';

const MAX_IMAGE_SIZE = 500 * 1024; // 500 KB

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
    description: item?.description || '',
    image: item?.image || ''
  });

  const [imageError, setImageError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Choose a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be smaller than 500 KB.');
      event.target.value = '';
      return;
    }

    setImageLoading(true);

    const reader = new FileReader();

    reader.onload = () => {
      setForm(previous => ({
        ...previous,
        image: String(reader.result)
      }));
      setImageLoading(false);
    };

    reader.onerror = () => {
      setImageError('Could not read this picture. Try another one.');
      setImageLoading(false);
    };

    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const price = Number(form.price);

    if (
      !form.name.trim() ||
      !form.category ||
      form.price === '' ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      alert('Enter a valid item name, category, and price.');
      return;
    }

    if (imageLoading) return;

    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price
    });
  }

  return (
    <div className="card admin-form-card">
      <div className="admin-form-intro">
        <span className="eyebrow">MENU CATALOG</span>
        <h2>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        <p className="muted">
          Add food details and a photo to help customers recognize your dishes.
        </p>
      </div>

      <form className="admin-item-form" onSubmit={handleSubmit}>
        <div className="admin-form-section-title">
          Food Picture
        </div>

        <div className="admin-image-upload">
          <div className="admin-image-preview">
            {form.image ? (
              <img
                src={form.image}
                alt={`${form.name || 'Menu item'} preview`}
              />
            ) : (
              <div className="admin-image-empty">
                <span className="admin-image-symbol">▧</span>
                <span>No picture selected</span>
              </div>
            )}
          </div>

          <div className="admin-image-upload-info">
            <label htmlFor="item-image" className="admin-upload-button">
              Choose Picture
            </label>

            <input
              id="item-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="admin-file-input"
            />

            <p className="muted">
              JPG, PNG, or WebP · Maximum 500 KB
            </p>

            {form.image && (
              <button
                type="button"
                className="admin-remove-image"
                onClick={() => {
                  setForm(previous => ({
                    ...previous,
                    image: ''
                  }));
                  setImageError('');
                }}
              >
                Remove picture
              </button>
            )}

            {imageLoading && (
              <p role="status" className="muted">
                Loading picture...
              </p>
            )}

            {imageError && (
              <p role="alert" className="admin-image-error">
                {imageError}
              </p>
            )}
          </div>
        </div>

        <div className="admin-form-section-title">
          Item Information
        </div>

        <label htmlFor="item-name">Item Name</label>
        <input
          id="item-name"
          type="text"
          name="name"
          placeholder="e.g. Iced Matcha Latte"
          value={form.name}
          onChange={handleChange}
          maxLength={100}
          required
        />

        <label htmlFor="item-category">Category</label>
        <select
          id="item-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
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
          placeholder="0.00"
          value={form.price}
          onChange={handleChange}
          required
        />

        <label htmlFor="item-description">Description</label>
        <textarea
          id="item-description"
          name="description"
          placeholder="Describe the ingredients, flavor, or serving style..."
          value={form.description}
          onChange={handleChange}
          rows={3}
          maxLength={500}
        />

        <div className="admin-form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={imageLoading}
          >
            {item ? 'Save Changes' : 'Add Menu Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
