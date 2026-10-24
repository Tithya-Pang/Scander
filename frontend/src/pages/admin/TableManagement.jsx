
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import Icon from '../../components/common/Icon';
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

const statusIcons = {
  Available: 'checkCircle',
  Occupied: 'user',
  Maintenance: 'settings'
};

function TableQRCodeDialog({ table, onClose, getTableUrl }) {
  const [copied, setCopied] = useState(false);
  const url = getTableUrl(table);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener(
      'keydown',
      handleEscape
    );
  }, [onClose]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access may be blocked by the browser.
      setCopied(false);
      window.prompt('Copy the menu link:', url);
    }
  }

  return (
    <div className="a-qr-overlay" onClick={onClose}>
      <div
        className="a-qr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a-qr-title"
        onClick={event => event.stopPropagation()}
      >
        <header className="a-qr-header">
          <div>
            <span className="eyebrow">TABLE QR CODE</span>
            <h2 id="a-qr-title">{table.name}</h2>
            <p>Scan to open the Gather Grounds customer menu.</p>
          </div>

          <button
            type="button"
            className="a-qr-close"
            onClick={onClose}
            aria-label="Close QR code"
          >
            ×
          </button>
        </header>

        <div className="a-qr-content">
          <div className="a-qr-brand">
            <span className="a-qr-brand-icon">
              <Icon name="coffee" size={22} />
            </span>

            <strong>Gather Grounds<span>.</span></strong>
          </div>

          <div className="a-qr-paper">
            <QRCodeSVG
              value={url}
              size={210}
              level="M"
              marginSize={4}
            />
          </div>

          <h3>{table.name}</h3>
          <p>Scan to explore our menu and place your order.</p>
          <span className="a-qr-demo-notice">
            Frontend preview · Not for production
          </span>
        </div>

        <div className="a-qr-link">
          <small>Customer menu link</small>
          <code>{url}</code>
        </div>

        <div className="a-qr-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={copyUrl}
          >
            <Icon name={copied ? 'check' : 'file'} size={16} />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <a
            className="btn btn-primary"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Open Menu
            <Icon name="chevronRight" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TableManagement() {
  const [tables, setTables] = useState(initialTables);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [editingTable, setEditingTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);

  const selectedTable = tables.find(
    table => table.id === selectedTableId
  ) || null;

  const counts = {
    Available: tables.filter(t => t.status === 'Available').length,
    Occupied: tables.filter(t => t.status === 'Occupied').length,
    Maintenance: tables.filter(t => t.status === 'Maintenance').length
  };

  const filteredTables = tables.filter(table => {
    const matchesName = table.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || table.status === statusFilter;

    return matchesName && matchesStatus;
  });

  function openAddForm() {
    setEditingTable(null);
    setShowForm(true);
  }

  function openEditForm(table) {
    setEditingTable(table);
    setShowForm(true);
  }

  function closeForm() {
    setEditingTable(null);
    setShowForm(false);
  }

  function handleSave(formData) {
    const duplicate = tables.some(table =>
      table.name.toLowerCase() === formData.name.toLowerCase() &&
      table.id !== editingTable?.id
    );

    if (duplicate) {
      alert('A table with this name already exists.');
      return;
    }

    if (editingTable) {
      setTables(previous => previous.map(table =>
        table.id === editingTable.id
          ? { ...table, ...formData }
          : table
      ));
    } else {
      const newId = Math.max(0, ...tables.map(t => t.id)) + 1;

      setTables(previous => [
        ...previous,
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
    if (!statuses.includes(status)) return;

    setTables(previous => previous.map(table =>
      table.id === id ? { ...table, status } : table
    ));
  }

  function handleDelete(table) {
    if (table.status === 'Occupied') {
      alert('Occupied tables cannot be deleted.');
      return;
    }

    const confirmed = window.confirm(
      `Delete "${table.name}"?`
    );

    if (!confirmed) return;

    setTables(previous => previous.filter(
      entry => entry.id !== table.id
    ));

    if (selectedTableId === table.id) {
      setSelectedTableId(null);
    }
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('All');
  }

  // Keep the table ID stable even when its name changes.
  function getTableUrl(table) {
    const url = new URL('/customer/menu', window.location.origin);
    url.searchParams.set('table', String(table.id));
    return url.toString();
  }

  return (
    <section className="a-tables-page">
      <header className="a-tables-heading">
        <div>
          <span className="eyebrow">RESTAURANT MANAGEMENT</span>
          <h1>Table Management</h1>
          <p>
            Manage seating, table availability, and ordering QR codes.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddForm}
        >
          <Icon name="plus" size={18} />
          Add Table
        </button>
      </header>

      <div className="a-tables-stats">
        {[
          {
            label: 'Total Tables',
            value: tables.length,
            tone: 'slate',
            icon: 'grid'
          },
          {
            label: 'Available',
            value: counts.Available,
            tone: 'green',
            icon: 'checkCircle'
          },
          {
            label: 'Occupied',
            value: counts.Occupied,
            tone: 'amber',
            icon: 'user'
          },
          {
            label: 'Maintenance',
            value: counts.Maintenance,
            tone: 'purple',
            icon: 'settings'
          }
        ].map(stat => (
          <article
            key={stat.label}
            className={`a-tables-stat a-tables-stat-${stat.tone}`}
          >
            <div>
              <span>{stat.label}</span>
              <Icon name={stat.icon} size={21} />
            </div>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      {showForm && (
        <TableForm
          key={editingTable?.id ?? 'new'}
          table={editingTable}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      <section className="card a-tables-panel">
        <div className="a-tables-panel-header">
          <div>
            <h2>Restaurant Tables</h2>
            <p>{filteredTables.length} tables found</p>
          </div>

          <span className="a-tables-demo">
            <Icon name="file" size={15} />
            Demo data
          </span>
        </div>

        <div className="a-tables-filters">
          <label className="a-tables-search">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Search tables..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search tables"
            />
          </label>

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            aria-label="Filter table status"
          >
            <option value="All">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="a-tables-reset"
            onClick={resetFilters}
            aria-label="Reset filters"
            title="Reset filters"
          >
            <Icon name="refresh" size={19} />
          </button>
        </div>

        <div className="table-scroll">
          <table className="a-tables-table">
            <thead>
              <tr>
                <th>TABLE</th>
                <th>SEATING</th>
                <th>STATUS</th>
                <th>QR CODE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredTables.map(table => (
                <tr key={table.id}>
                  <td>
                    <div className="a-table-name-cell">
                      <span className="a-table-icon">
                        <Icon name="grid" size={20} />
                      </span>

                      <div>
                        <strong>{table.name}</strong>
                        <small>Table ID: {table.id}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="a-table-capacity">
                      <Icon name="user" size={16} />
                      {table.capacity} seats
                    </span>
                  </td>

                  <td>
                    <label className={`a-table-status a-table-status-${table.status.toLowerCase()}`}>
                      <Icon name={statusIcons[table.status]} size={16} />
                      <select
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
                    </label>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="a-table-qr-button"
                      onClick={() => setSelectedTableId(table.id)}
                    >
                      <Icon name="grid" size={17} />
                      View QR
                    </button>
                  </td>

                  <td>
                    <div className="a-table-actions">
                      <button
                        type="button"
                        className="a-catalog-edit"
                        onClick={() => openEditForm(table)}
                      >
                        <Icon name="pencil" size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="a-catalog-delete"
                        onClick={() => handleDelete(table)}
                        disabled={table.status === 'Occupied'}
                        title={
                          table.status === 'Occupied'
                            ? 'Occupied tables cannot be deleted'
                            : 'Delete table'
                        }
                      >
                        <Icon name="trash" size={15} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTables.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    No matching tables found.
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

      {selectedTable && (
        <TableQRCodeDialog
          table={selectedTable}
          onClose={() => setSelectedTableId(null)}
          getTableUrl={getTableUrl}
        />
      )}
    </section>
  );
}
