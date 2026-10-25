
import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import Icon from '../../components/common/Icon';

import {
  getAdminTables,
  createAdminTable,
  updateAdminTable,
  setAdminTableActive,
} from '../../services/adminTableService';

// ==========================================
// HELPERS
// ==========================================

const statuses = ['Active', 'Inactive'];

function convertTable(record) {
  return {
    id: record.table_id,
    name: record.table_number,
    qrToken: record.qr_token,
    isActive: record.is_active,
    status: record.is_active ? 'Active' : 'Inactive',
  };
}

function getTableUrl(table) {
  const url = new URL(
    '/customer/menu',
    window.location.origin
  );

  // Keep the existing table parameter for compatibility.
  url.searchParams.set('table', String(table.id));

  // Real token generated and stored by Supabase.
  url.searchParams.set('qr_token', table.qrToken);

  return url.toString();
}

// ==========================================
// ADD / EDIT FORM
// ==========================================

function TableEditor({
  table,
  onSave,
  onCancel,
  saving,
}) {
  const [name, setName] = useState(table?.name || '');

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length > 20) {
      return;
    }

    onSave(trimmedName);
  }

  return (
    <section className="card admin-form-card">
      <div className="admin-form-intro">
        <span className="eyebrow">
          RESTAURANT TABLES
        </span>

        <h2>
          {table ? 'Edit Table' : 'Add New Table'}
        </h2>

        <p>
          {table
            ? 'Update the name of this restaurant table.'
            : 'Create a new table with a unique QR code.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-field">
          <label htmlFor="table-number">
            Table Name
          </label>

          <input
            id="table-number"
            type="text"
            value={name}
            onChange={event =>
              setName(event.target.value)
            }
            maxLength={20}
            placeholder="Example: Table 01"
            required
            disabled={saving}
          />
        </div>

        <p className="muted">
          Maximum 20 characters.
          Each table needs a unique name.
        </p>

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
            disabled={
              saving ||
              !name.trim() ||
              name.trim().length > 20
            }
          >
            {saving
              ? 'Saving...'
              : table
                ? 'Save Changes'
                : 'Add Table'}
          </button>
        </div>
      </form>
    </section>
  );
}

// ==========================================
// QR CODE POPUP
// ==========================================

function TableQRCodeDialog({ table, onClose }) {
  const [copied, setCopied] = useState(false);

  const url = getTableUrl(table);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [onClose]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt(
        'Copy the customer menu link:',
        url
      );
    }
  }

  return (
    <div
      className="a-qr-overlay"
      onClick={onClose}
    >
      <div
        className="a-qr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a-qr-title"
        onClick={event => event.stopPropagation()}
      >
        <header className="a-qr-header">
          <div>
            <span className="eyebrow">
              TABLE QR CODE
            </span>

            <h2 id="a-qr-title">
              {table.name}
            </h2>

            <p>
              Scan to open the Gather Grounds
              customer menu.
            </p>
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
              <Icon
                name="coffee"
                size={22}
              />
            </span>

            <strong>
              Gather Grounds
              <span>.</span>
            </strong>
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

          <p>
            Scan to explore our menu
            and place your order.
          </p>

          <span className="a-qr-demo-notice">
            Customer QR validation
            pending integration
          </span>
        </div>

        <div className="a-qr-link">
          <small>
            Customer menu link
          </small>

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
            <Icon
              name={copied ? 'check' : 'file'}
              size={16}
            />

            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <a
            className="btn btn-primary"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Open Menu

            <Icon
              name="chevronRight"
              size={16}
            />
          </a>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TABLE MANAGEMENT PAGE
// ==========================================

export default function TableManagement() {
  const [tables, setTables] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTableId, setBusyTableId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('All');

  const [editingTable, setEditingTable] =
    useState(null);

  const [showForm, setShowForm] = useState(false);

  const [selectedTableId, setSelectedTableId] =
    useState(null);

  // ==========================================
  // FETCH TABLES FROM BACKEND
  // ==========================================

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const records = await getAdminTables();

      setTables(records.map(convertTable));
    } catch (err) {
      console.error(
        'Failed to load tables:',
        err
      );

      setError(
        err.message || 'Unable to load tables.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // ==========================================
  // SELECTED TABLE FOR QR POPUP
  // ==========================================

  const selectedTable =
    tables.find(
      table => table.id === selectedTableId
    ) || null;

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const counts = {
    Active: tables.filter(
      table => table.isActive
    ).length,

    Inactive: tables.filter(
      table => !table.isActive
    ).length,
  };

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      table.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // FORM ACTIONS
  // ==========================================

  function openAddForm() {
    setEditingTable(null);
    setShowForm(true);
    setError('');
    setNotice('');
  }

  function openEditForm(table) {
    setEditingTable(table);
    setShowForm(true);
    setError('');
    setNotice('');
  }

  function closeForm() {
    if (saving) return;

    setEditingTable(null);
    setShowForm(false);
  }

  // ==========================================
  // ADD / UPDATE TABLE
  // ==========================================

  async function handleSave(name) {
    const trimmedName = name.trim();

    if (
      !trimmedName ||
      trimmedName.length > 20
    ) {
      setError(
        'Table name must contain 1 to 20 characters.'
      );
      return;
    }

    const duplicate = tables.some(
      table =>
        table.name.toLowerCase() ===
          trimmedName.toLowerCase() &&
        table.id !== editingTable?.id
    );

    if (duplicate) {
      setError(
        'A table with this name already exists.'
      );
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      if (editingTable) {
        await updateAdminTable(
          editingTable.id,
          trimmedName
        );

        setNotice(
          'Table updated successfully.'
        );
      } else {
        await createAdminTable(trimmedName);

        setNotice(
          'Table created successfully.'
        );
      }

      setShowForm(false);
      setEditingTable(null);

      await loadTables();
    } catch (err) {
      console.error(
        'Failed to save table:',
        err
      );

      setError(
        err.message || 'Unable to save table.'
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // ACTIVATE / DEACTIVATE TABLE
  // ==========================================

  async function changeStatus(table, newStatus) {
    const newIsActive = newStatus === 'Active';

    if (table.isActive === newIsActive) {
      return;
    }

    if (!newIsActive) {
      const confirmed = window.confirm(
        `Deactivate "${table.name}"?\n\n` +
        'Its QR code should no longer be accepted ' +
        'for new orders once customer-side validation ' +
        'is connected.'
      );

      if (!confirmed) return;
    }

    setBusyTableId(table.id);
    setError('');
    setNotice('');

    try {
      await setAdminTableActive(
        table.id,
        newIsActive
      );

      setTables(previous =>
        previous.map(entry =>
          entry.id === table.id
            ? {
                ...entry,
                isActive: newIsActive,
                status: newIsActive
                  ? 'Active'
                  : 'Inactive',
              }
            : entry
        )
      );

      setNotice(
        `${table.name} is now ${
          newIsActive ? 'active' : 'inactive'
        }.`
      );
    } catch (err) {
      console.error(
        'Failed to update table status:',
        err
      );

      setError(
        err.message ||
        'Unable to update table status.'
      );

      // Restore the server's current state.
      await loadTables();
    } finally {
      setBusyTableId(null);
    }
  }

  // ==========================================
  // DEACTIVATE INSTEAD OF DELETE
  // ==========================================

  async function handleDeactivate(table) {
    if (!table.isActive) return;

    await changeStatus(table, 'Inactive');
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('All');
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <section className="a-tables-page">

      {/* HEADER */}
      <header className="a-tables-heading">
        <div>
          <span className="eyebrow">
            RESTAURANT MANAGEMENT
          </span>

          <h1>Table Management</h1>

          <p>
            Manage restaurant tables,
            ordering access, and QR codes.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddForm}
          disabled={loading}
        >
          <Icon
            name="plus"
            size={18}
          />

          Add Table
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <div className="a-tables-stats">
        {[
          {
            label: 'Total Tables',
            value: tables.length,
            tone: 'slate',
            icon: 'grid',
          },
          {
            label: 'Active',
            value: counts.Active,
            tone: 'green',
            icon: 'checkCircle',
          },
          {
            label: 'Inactive',
            value: counts.Inactive,
            tone: 'purple',
            icon: 'settings',
          },
        ].map(stat => (
          <article
            key={stat.label}
            className={`a-tables-stat a-tables-stat-${stat.tone}`}
          >
            <div>
              <span>{stat.label}</span>

              <Icon
                name={stat.icon}
                size={21}
              />
            </div>

            <strong>
              {loading ? '...' : stat.value}
            </strong>
          </article>
        ))}
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <p
          role="alert"
          style={{
            color: '#b42318',
            marginBottom: 16,
          }}
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          style={{
            color: '#287444',
            marginBottom: 16,
          }}
        >
          {notice}
        </p>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <TableEditor
          key={editingTable?.id ?? 'new'}
          table={editingTable}
          onSave={handleSave}
          onCancel={closeForm}
          saving={saving}
        />
      )}

      {/* RESTAURANT TABLES */}
      <section className="card a-tables-panel">

        <div className="a-tables-panel-header">
          <div>
            <h2>Restaurant Tables</h2>

            <p>
              {loading
                ? 'Loading restaurant tables...'
                : `${filteredTables.length} tables found`}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={loadTables}
            disabled={loading}
          >
            <Icon
              name="refresh"
              size={15}
            />

            Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="a-tables-filters">
          <label className="a-tables-search">
            <Icon
              name="search"
              size={19}
            />

            <input
              type="search"
              placeholder="Search tables..."
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              aria-label="Search tables"
            />
          </label>

          <select
            value={statusFilter}
            onChange={event =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter table status"
          >
            <option value="All">
              All Statuses
            </option>

            {statuses.map(status => (
              <option
                key={status}
                value={status}
              >
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
            <Icon
              name="refresh"
              size={19}
            />
          </button>
        </div>

        {/* TABLE LIST */}
        <div className="table-scroll">
          <table className="a-tables-table">
            <thead>
              <tr>
                <th>TABLE</th>
                <th>QR ACCESS</th>
                <th>STATUS</th>
                <th>QR CODE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="admin-empty"
                  >
                    Loading tables...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredTables.map(table => (
                  <tr key={table.id}>

                    {/* TABLE NAME */}
                    <td>
                      <div className="a-table-name-cell">
                        <span className="a-table-icon">
                          <Icon
                            name="grid"
                            size={20}
                          />
                        </span>

                        <div>
                          <strong>
                            {table.name}
                          </strong>

                          <small>
                            Table ID: {table.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* QR ACCESS */}
                    <td>
                      <span className="a-table-capacity">
                        <Icon
                          name={
                            table.isActive
                              ? 'checkCircle'
                              : 'lock'
                          }
                          size={16}
                        />

                        {table.isActive
                          ? 'Enabled'
                          : 'Disabled'}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <label
                        className={`a-table-status a-table-status-${
                          table.isActive
                            ? 'available'
                            : 'maintenance'
                        }`}
                      >
                        <Icon
                          name={
                            table.isActive
                              ? 'checkCircle'
                              : 'settings'
                          }
                          size={16}
                        />

                        <select
                          value={table.status}
                          disabled={
                            busyTableId === table.id
                          }
                          onChange={event =>
                            changeStatus(
                              table,
                              event.target.value
                            )
                          }
                          aria-label={`Status for ${table.name}`}
                        >
                          {statuses.map(status => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </td>

                    {/* QR CODE */}
                    <td>
                      <button
                        type="button"
                        className="a-table-qr-button"
                        disabled={
                          !table.isActive ||
                          !table.qrToken
                        }
                        onClick={() =>
                          setSelectedTableId(
                            table.id
                          )
                        }
                      >
                        <Icon
                          name="grid"
                          size={17}
                        />

                        View QR
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="a-table-actions">
                        <button
                          type="button"
                          className="a-catalog-edit"
                          onClick={() =>
                            openEditForm(table)
                          }
                        >
                          <Icon
                            name="pencil"
                            size={15}
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          className="a-catalog-delete"
                          onClick={() =>
                            handleDeactivate(table)
                          }
                          disabled={
                            !table.isActive ||
                            busyTableId === table.id
                          }
                          title={
                            table.isActive
                              ? 'Deactivate table'
                              : 'Table already inactive'
                          }
                        >
                          <Icon
                            name="lock"
                            size={15}
                          />

                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading &&
                filteredTables.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="admin-empty"
                    >
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

      {/* QR CODE POPUP */}
      {selectedTable && selectedTable.isActive && (
        <TableQRCodeDialog
          table={selectedTable}
          onClose={() =>
            setSelectedTableId(null)
          }
        />
      )}
    </section>
  );
}
