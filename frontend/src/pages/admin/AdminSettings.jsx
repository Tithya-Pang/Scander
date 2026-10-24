
import { useEffect, useState } from 'react';
import Icon from '../../components/common/Icon';

const STORAGE_KEY = 'scander.admin.settings.v1';

const defaultSettings = {
  restaurantName: 'Gather Grounds',
  email: 'contact@gathergrounds.com',
  phone: '',
  address: '',
  currency: 'USD',
  density: 'comfortable'
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      return { ...defaultSettings, ...saved };
    }
  } catch {
    // Use defaults when browser storage is unavailable.
  }

  return { ...defaultSettings };
}

function SettingsSection({ icon, title, description, children }) {
  return (
    <section className="card a-settings-section">
      <header className="a-settings-section-head">
        <span className="a-settings-section-icon">
          <Icon name={icon} size={22} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export default function AdminSettings() {
  const [saved, setSaved] = useState(loadSettings);
  const [draft, setDraft] = useState(saved);
  const [message, setMessage] = useState('');

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function updateField(name, value) {
    setDraft(previous => ({
      ...previous,
      [name]: value
    }));
    setMessage('');
  }

  function handleSave(event) {
    event.preventDefault();

    const cleaned = {
      ...draft,
      restaurantName: draft.restaurantName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim()
    };

    if (!cleaned.restaurantName) {
      setMessage('Restaurant name is required.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch {
      setMessage('Could not save. Browser storage may be unavailable.');
      return;
    }

    setSaved(cleaned);
    setDraft(cleaned);

    document.querySelector('.admin-shell')?.setAttribute(
      'data-density',
      cleaned.density
    );

    setMessage('Settings saved in this browser.');
  }

  function discardChanges() {
    setDraft({ ...saved });
    setMessage('');
  }

  useEffect(() => {
    document.title = 'Admin Settings | Gather Grounds';

    return () => {
      document.title = 'Gather Grounds';
    };
  }, []);

  return (
    <section className="a-settings-page">
      <header className="a-settings-heading">
        <div>
          <span className="eyebrow">WORKSPACE PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage restaurant information and Admin display preferences.</p>
        </div>

        <span className="a-settings-demo">
          <Icon name="file" size={16} />
          Saved on this browser
        </span>
      </header>

      <form onSubmit={handleSave} className="a-settings-form">
        <SettingsSection
          icon="coffee"
          title="Restaurant Profile"
          description="Basic business information for your restaurant."
        >
          <div className="a-settings-fields">
            <label>
              Restaurant Name
              <input
                type="text"
                value={draft.restaurantName}
                onChange={event =>
                  updateField('restaurantName', event.target.value)
                }
                maxLength={100}
                required
              />
            </label>

            <label>
              Contact Email
              <input
                type="email"
                value={draft.email}
                onChange={event =>
                  updateField('email', event.target.value)
                }
                placeholder="restaurant@example.com"
                maxLength={150}
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value={draft.phone}
                onChange={event =>
                  updateField('phone', event.target.value)
                }
                placeholder="+855 ..."
                maxLength={30}
              />
            </label>

            <label>
              Display Currency
              <select
                value={draft.currency}
                onChange={event =>
                  updateField('currency', event.target.value)
                }
              >
                <option value="USD">USD — US Dollar</option>
                <option value="KHR">KHR — Cambodian Riel</option>
              </select>
            </label>

            <label className="a-settings-full">
              Restaurant Address
              <textarea
                value={draft.address}
                onChange={event =>
                  updateField('address', event.target.value)
                }
                placeholder="Street, city, country..."
                rows={3}
                maxLength={300}
              />
            </label>
          </div>

          <p className="a-settings-note">
            These details are saved locally for now. They are not yet
            published to the customer-facing menu.
          </p>
        </SettingsSection>

        <SettingsSection
          icon="palette"
          title="Display Preferences"
          description="Adjust the spacing of Admin tables."
        >
          <div className="a-settings-choice-group">
            <label
              className={`a-settings-choice ${
                draft.density === 'comfortable' ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name="density"
                value="comfortable"
                checked={draft.density === 'comfortable'}
                onChange={() =>
                  updateField('density', 'comfortable')
                }
              />

              <span>
                <strong>Comfortable</strong>
                <small>More space between rows, easier to read.</small>
              </span>
            </label>

            <label
              className={`a-settings-choice ${
                draft.density === 'compact' ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name="density"
                value="compact"
                checked={draft.density === 'compact'}
                onChange={() =>
                  updateField('density', 'compact')
                }
              />

              <span>
                <strong>Compact</strong>
                <small>Show more table rows on the screen.</small>
              </span>
            </label>
          </div>
        </SettingsSection>

        <SettingsSection
          icon="user"
          title="Administrator Account"
          description="Authentication will be managed by the backend."
        >
          <div className="a-settings-account">
            <span className="a-settings-avatar">
              <Icon name="user" size={24} />
            </span>

            <div>
              <strong>Restaurant Administrator</strong>
              <p>Role: Admin · Demonstration account</p>
            </div>

            <span className="a-settings-account-badge">
              Preview only
            </span>
          </div>

          <p className="a-settings-note">
            User accounts, passwords and permissions are not editable
            here yet. The backend will manage authenticated staff.
          </p>
        </SettingsSection>

        <footer className="a-settings-save-bar">
          <div className="a-settings-save-message" role="status">
            <Icon
              name={dirty ? 'alert' : 'checkCircle'}
              size={19}
            />
            <span>
              {message || (
                dirty
                  ? 'You have unsaved changes.'
                  : 'All changes saved or using defaults.'
              )}
            </span>
          </div>

          <div className="a-settings-buttons">
            <button
              type="button"
              className="btn btn-outline"
              disabled={!dirty}
              onClick={discardChanges}
            >
              Discard
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!dirty}
            >
              <Icon name="check" size={18} />
              Save Changes
            </button>
          </div>
        </footer>
      </form>
    </section>
  );
}
