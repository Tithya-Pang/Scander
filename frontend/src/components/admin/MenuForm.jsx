
import { useEffect, useState } from 'react';

const MAX_IMAGE_SIZE = 500 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export default function MenuForm({
  item,
  categories,
  onSave,
  onCancel,
  saving = false,
  saveError = '',
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || categories[0] || '',
    price: item?.price ?? '',
    description: item?.description || '',
    image: item?.image || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');

  // Show a temporary preview for the selected file.
  const [previewUrl, setPreviewUrl] = useState(
    item?.image || ''
  );

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(form.image || '');
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile, form.image]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Choose a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be 500 KB or smaller.');
      event.target.value = '';
      return;
    }

    setImageFile(file);
  }

  function removeImage() {
    if (saving) return;

    setImageFile(null);
    setForm(previous => ({
      ...previous,
      image: '',
    }));
    setImageError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const price = Number(form.price);

    if (
      !form.name.trim() ||
      !form.category ||
      form.price === '' ||
      !Number.isFinite(price) ||
      price <= 0 ||
      Math.abs(
        price * 100 - Math.round(price * 100)
      ) > 0.000001
    ) {
      alert(
        'Enter a valid item name, category, and price with up to 2 decimal places.'
      );
      return;
    }

    if (imageError) return;

    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      imageFile,
    });
  }

  return (
    <div className="card admin-form-card">
      <div className="admin-form-intro">
        <span className="eyebrow">MENU CATALOG</span>

        <h2>
          {item ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>

        <p className="muted">
          Add food details and a picture to help
          customers recognize your dishes.
        </p>
      </div>

      <form
        className="admin-item-form"
        onSubmit={handleSubmit}
      >
        {/* FOOD PICTURE */}
        <div className="admin-form-section-title">
          Food Picture
        </div>

        <div className="admin-image-upload">
          <div className="admin-image-preview">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`${form.name || 'Menu item'} preview`}
              />
            ) : (
              <div className="admin-image-empty">
                <span className="admin-image-symbol">
                  ▧
                </span>
                <span>No picture selected</span>
              </div>
            )}
          </div>

          <div className="admin-image-upload-info">
            <label
              htmlFor="item-image"
              className="admin-upload-button"
              style={
                saving
                  ? {
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    }
                  : undefined
              }
            >
              Choose Picture
            </label>

            <input
              id="item-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="admin-file-input"
              disabled={saving}
            />

            <p className="muted">
              JPG, PNG, or WebP · Maximum 500 KB
            </p>

            {previewUrl && (
              <button
                type="button"
                className="admin-remove-image"
                onClick={removeImage}
                disabled={saving}
              >
                Remove picture
              </button>
            )}

            {imageError && (
              <p
                role="alert"
                className="admin-image-error"
              >
                {imageError}
              </p>
            )}
          </div>
        </div>

        {/* ITEM INFORMATION */}
        <div className="admin-form-section-title">
          Item Information
        </div>

        <label htmlFor="item-name">
          Item Name
        </label>

        <input
          id="item-name"
          type="text"
          name="name"
          placeholder="e.g. Iced Matcha Latte"
          value={form.name}
          onChange={handleChange}
          maxLength={100}
          disabled={saving}
          required
        />

        <label htmlFor="item-category">
          Category
        </label>

        <select
          id="item-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          disabled={saving}
          required
        >
          {categories.map(category => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        <label htmlFor="item-price">
          Price ($)
        </label>

        <input
          id="item-price"
          type="number"
          name="price"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.price}
          onChange={handleChange}
          disabled={saving}
          required
        />

        <label htmlFor="item-description">
          Description
        </label>

        <textarea
          id="item-description"
          name="description"
          placeholder="Describe the ingredients, flavor, or serving style..."
          value={form.description}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          disabled={saving}
        />

        {/* SAVE ERROR */}
        {saveError && (
          <p
            role="alert"
            className="admin-image-error"
          >
            {saveError}
          </p>
        )}

        {/* FORM ACTIONS */}
        <div className="admin-form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || !!imageError}
          >
            {saving
              ? 'Saving...'
              : item
                ? 'Save Changes'
                : 'Add Menu Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
