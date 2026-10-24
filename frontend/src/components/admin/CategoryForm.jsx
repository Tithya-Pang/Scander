
import { useState } from 'react';

export default function CategoryForm({
  category,
  onSave,
  onCancel
}) {
  const [name, setName] = useState(category?.name || '');

  function handleSubmit(event) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      alert('Please enter a category name.');
      return;
    }

    onSave(cleanName);
  }

  return (
    <div className="card admin-category-form">
      <h2>
        {category ? 'Edit Category' : 'Add New Category'}
      </h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="category-name">
          Category Name
        </label>

        <input
          id="category-name"
          type="text"
          placeholder="e.g. Smoothies"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
        />

        <div className="admin-form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-primary">
            {category ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
