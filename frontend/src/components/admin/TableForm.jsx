
import { useState } from 'react';

export default function TableForm({
  table,
  onSave,
  onCancel
}) {
  const [name, setName] = useState(table?.name ?? '');
  const [capacity, setCapacity] = useState(table?.capacity ?? 4);

  function handleSubmit(event) {
    event.preventDefault();

    const seats = Number(capacity);

    if (!name.trim() || !Number.isInteger(seats) || seats < 1) {
      alert('Enter a table name and a valid seating capacity.');
      return;
    }

    onSave({
      name: name.trim(),
      capacity: seats
    });
  }

  return (
    <div className="card admin-table-form">
      <h2>{table ? 'Edit Table' : 'Add New Table'}</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="table-name">Table Name</label>
        <input
          id="table-name"
          type="text"
          placeholder="e.g. Table 09"
          value={name}
          onChange={event => setName(event.target.value)}
          maxLength={50}
          required
        />

        <label htmlFor="table-capacity">Seating Capacity</label>
        <input
          id="table-capacity"
          type="number"
          min="1"
          max="30"
          value={capacity}
          onChange={event => setCapacity(event.target.value)}
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
            {table ? 'Save Changes' : 'Add Table'}
          </button>
        </div>
      </form>
    </div>
  );
}
