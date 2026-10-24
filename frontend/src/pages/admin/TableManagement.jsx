
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import TableForm from '../../components/admin/TableForm';

const initialTables = [
  { id: 1, name: 'Table 01', capacity: 4, status: 'Available' },
  { id: 2, name: 'Table 02', capacity: 2, status: 'Occupied' },
  { id: 3, name: 'Table 03', capacity: 6, status: 'Available' },
  { id: 4, name: 'Table 04', capacity: 4, status: 'Occupied' },
  { id: 5, name: 'Table 05', capacity: 2, status: 'Available' },
  { id: 6, name: 'Table 06', capacity: 8, status: 'Maintenance' },
  { id: 7, name: 'Table 07', capacity: 4, status: 'Available' },
  { id: 8, name: 'Table 08', capacity: 4, status: 'Available' }
];

const statuses = ['Available', 'Occupied', 'Maintenance'];

export default function TableManagement() {
  const [tables, setTables] = useState(initialTables);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingTable, setEditingTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const filteredTables = tables.filter(table => {
    const matchesName = table.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' || table.status === filterStatus;

    return matchesName && matchesStatus;
  });

  const available = tables.filter(
    table => table.status === 'Available'
  ).length;

  const occupied = tables.filter(
    table => table.status === 'Occupied'
  ).length;

  const maintenance = tables.filter(
    table => table.status === 'Maintenance'
  ).length;

  function closeForm() {
    setShowForm(false);
    setEditingTable(null);
  }

  function handleSave(formData) {
    const duplicate = tables.some(
      table =>
        table.name.toLowerCase() === formData.name.toLowerCase() &&
        table.id !== editingTable?.id
    );

    if (duplicate) {
      alert('A table with this name already exists.');
      return;
    }

    if (editingTable) {
      setTables(prev =>
        prev.map(table =>
          table.id === editingTable.id
            ? { ...table, ...formData }
            : table
        )
      );
    } else {
      const newId = Math.max(0, ...tables.map(t => t.id)) + 1;

      setTables(prev => [
        ...prev,
        {
          id: newId,
          ...formData,
          status: 'Available'
        }
      ]);
    }

    closeForm();
  }

  function changeStatus(id, status) {
    setTables(prev =>
      prev.map(table =>
        table.id === id ? { ...table, status } : table
      )
    );
  }

  function handleDelete(table) {
    if (table.status === 'Occupied') {
      alert('Occupied tables cannot be deleted.');
      return;
    }

    if (!window.confirm(`Delete ${table.name}?`)) {
      return;
    }

    setTables(prev => prev.filter(t => t.id !== table.id));
    if (selectedTable?.id === table.id) {
      setSelectedTable(null);
    }
  }

  // The table ID stays the same when the display name changes.
  function getTableUrl(table) {
    const url = new URL('/customer/menu', window.location.origin);
    url.searchParams.set('table', String(table.id));
    return url.toString();
  }

  return (
    <section className="admin-tables">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">RESTAURANT MANAGEMENT</span>
          <h1>Table Management</h1>
          <p className="muted">
            Manage seating, table availability, and QR codes.
          </p>
          <p className="muted">
            Demo mode — changes are not saved after refreshing.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTable(null);
            setShowForm(true);
          }}
        >
          + Add Table
        </button>
      </div>

      <div className="admin-table-summary">
        <div className="card">
          <span className="muted">Total Tables</span>
          <strong>{tables.length}</strong>
        </div>
        <div className="card">
          <span className="muted">Available</span>
          <strong>{available}</strong>
        </div>
        <div className="card">
          <span className="muted">Occupied</span>
          <strong>{occupied}</strong>
        </div>
        <div className="card">
          <span className="muted">Maintenance</span>
          <strong>{maintenance}</strong>
        </div>
      </div>

      {showForm && (
        <TableForm
          key={editingTable?.id ?? 'new'}
          table={editingTable}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      <div className="card">
        <div className="admin-menu-toolbar">
          <input
            type="search"
            placeholder="Search tables..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            value={filterStatus}
            onChange={event => setFilterStatus(event.target.value)}
          >
            <option value="All">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Table</th>
                <th>Seats</th>
                <th>Status</th>
                <th>QR Code</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTables.map(table => (
                <tr key={table.id}>
                  <td>
                    <strong>{table.name}</strong>
                  </td>
                  <td>{table.capacity}</td>

                  <td>
                    <select
                      className={`table-status table-status-${table.status.toLowerCase()}`}
                      value={table.status}
                      onChange={event =>
                        changeStatus(table.id, event.target.value)
                      }
                      aria-label={`Status for ${table.name}`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => setSelectedTable(table)}
                    >
                      View QR
                    </button>
                  </td>

                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="btn btn-outline btn-small"
                        onClick={() => {
                          setEditingTable(table);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-small admin-delete-btn"
                        onClick={() => handleDelete(table)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTables.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty">
                    No tables found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTable && (
        <div className="admin-qr-overlay" onClick={() => setSelectedTable(null)}>
          <div
            className="card admin-qr-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-qr-title"
            onClick={event => event.stopPropagation()}
          >
            <h2 id="admin-qr-title">{selectedTable.name} — QR Code</h2>
            <p className="muted">
              Scan to open the Customer Menu for this table.
            </p>

            <div className="admin-qr-image">
              <QRCodeSVG
                value={getTableUrl(selectedTable)}
                size={210}
                level="M"
                marginSize={4}
              />
            </div>

            <p className="admin-qr-url">
              {getTableUrl(selectedTable)}
            </p>

            <div className="admin-form-actions">
              <button
                className="btn btn-outline"
                onClick={() => setSelectedTable(null)}
              >
                Close
              </button>
              <a
                className="btn btn-primary"
                href={getTableUrl(selectedTable)}
                target="_blank"
                rel="noreferrer"
              >
                Open Menu
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
