import { useState } from 'react';
import Icon from '../../components/common/Icon';
import { playChime, useKitchen } from '../../context/KitchenContext';
import { minutesBetween, RUSH_THRESHOLD_MINUTES } from '../../data/kitchenOrders';

const toneOptions = [['double-gong', 'Double Gong'], ['soft-chime', 'Soft Chime'], ['bright-bell', 'Bright Bell']];
const volumeOptions = [['soft', 'Soft'], ['standard', 'Standard'], ['loud', 'Loud']];
const themeOptions = [['light', 'sun', 'Light'], ['dark', 'moon', 'Dark'], ['auto', 'monitor', 'Auto']];

function Toggle({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="k-switch" onClick={() => onChange(!checked)}><span/></button>;
}

function Section({ icon, title, hint, children }) {
  return <section className="k-card k-settings-section">
    <header><span className="k-section-icon"><Icon name={icon} size={22}/></span><div><h2>{title}</h2><p>{hint}</p></div></header>
    {children}
  </section>;
}

function SettingRow({ icon, title, hint, children }) {
  return <div className="k-setting-row"><Icon name={icon} size={22}/><div><h3>{title}</h3><p>{hint}</p></div><div className="k-setting-control">{children}</div></div>;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('') || '?';
}

export default function KitchenSettings() {
  const { settings, savedAt, saveSettings, now } = useKitchen();
  const [draft, setDraft] = useState(settings);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(settings.profile);
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const set = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const savedAgo = savedAt && minutesBetween(savedAt, now);

  function applyProfile(event) {
    event.preventDefault();
    set('profile', { ...profileDraft, name: profileDraft.name.trim() || draft.profile.name, email: profileDraft.email.trim() });
    setEditingProfile(false);
  }

  return <section className="k-page k-settings">
    <header className="k-page-head">
      <div>
        <div className="k-title-row"><h1>Settings</h1><span className="k-live" title="Saved in this browser only until the backend is connected">Saved on this device</span></div>
        <p>Manage kitchen display preferences, alerts, and workflow settings.</p>
      </div>
    </header>

    <Section icon="user" title="Staff Profile" hint="Active culinary team member for this station.">
      {editingProfile
        ? <form className="k-profile-card k-profile-form" onSubmit={applyProfile}>
            <label>Name<input value={profileDraft.name} onChange={event => setProfileDraft({ ...profileDraft, name: event.target.value })} required/></label>
            <label>Email<input type="email" value={profileDraft.email} onChange={event => setProfileDraft({ ...profileDraft, email: event.target.value })}/></label>
            <label>Role<input value={profileDraft.role} onChange={event => setProfileDraft({ ...profileDraft, role: event.target.value })}/></label>
            <div className="k-form-actions">
              <button type="button" className="k-btn k-btn-outline" onClick={() => { setProfileDraft(draft.profile); setEditingProfile(false); }}>Cancel</button>
              <button type="submit" className="k-btn k-btn-primary">Apply</button>
            </div>
          </form>
        : <div className="k-profile-card">
            <span className="k-initials">{initials(draft.profile.name)}</span>
            <div><div className="k-profile-name"><strong>{draft.profile.name}</strong>{draft.profile.role && <span className="k-role">{draft.profile.role}</span>}</div>
              {draft.profile.email && <small><Icon name="mail" size={14}/>{draft.profile.email}</small>}</div>
            <button type="button" className="k-btn k-btn-outline" onClick={() => { setProfileDraft(draft.profile); setEditingProfile(true); }}><Icon name="pencil" size={16}/>Edit Profile</button>
          </div>}
    </Section>

    <Section icon="bell" title="Kitchen Order Alerts & Sound Preferences" hint="Configure how incoming tickets and urgent reminders alert the station.">
      <SettingRow icon="bell" title="New Order Notifications" hint="Show a banner (and play the chime below) whenever a new order is received from a table.">
        <Toggle label="New order notifications" checked={draft.newOrderAlerts} onChange={value => set('newOrderAlerts', value)}/>
      </SettingRow>
      <SettingRow icon="volume" title="Notification Sound & Tone" hint="Choose the chime and volume for loud cooking environments.">
        <label className="k-select k-select-compact"><select aria-label="Chime tone" value={draft.tone} disabled={!draft.sound} onChange={event => set('tone', event.target.value)}>{toneOptions.map(([value, label]) => <option key={value} value={value}>Chime: {label}</option>)}</select><Icon name="chevronDown" size={16}/></label>
        <label className="k-select k-select-compact"><select aria-label="Chime volume" value={draft.volume} disabled={!draft.sound} onChange={event => set('volume', event.target.value)}>{volumeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Icon name="chevronDown" size={16}/></label>
        <button type="button" className="k-btn k-btn-outline k-btn-sm" disabled={!draft.sound} onClick={() => playChime(draft.tone, draft.volume)}>Test</button>
        <Toggle label="Notification sound" checked={draft.sound} onChange={value => set('sound', value)}/>
      </SettingRow>
      <SettingRow icon="timer" title="Order Status Updates & Rush Alerts" hint={`Highlight tickets in amber once they pass the ${RUSH_THRESHOLD_MINUTES}-minute threshold.`}>
        <Toggle label="Rush alerts" checked={draft.rushAlerts} onChange={value => set('rushAlerts', value)}/>
      </SettingRow>
    </Section>

    <Section icon="palette" title="Display Appearance" hint="Adjust the screen theme for station lighting conditions.">
      <div className="k-setting-block">
        <h3>Theme Mode</h3><p>Switch between light or dark theme for your station. Auto follows the device setting.</p>
        <div className="k-segmented" role="radiogroup" aria-label="Theme mode">{themeOptions.map(([value, icon, label]) =>
          <button type="button" key={value} role="radio" aria-checked={draft.theme === value} className={draft.theme === value ? 'active' : ''} onClick={() => set('theme', value)}><Icon name={icon} size={18}/>{label}</button>)}</div>
      </div>
    </Section>

    <footer className="k-card k-save-bar">
      <span className={dirty ? 'k-unsaved' : ''}><Icon name={dirty ? 'alert' : 'checkCircle'} size={18}/>{dirty ? 'You have unsaved changes.' : 'All changes saved. Settings are stored in this browser only.'}</span>
      <span className="k-saved-at">{savedAt ? `Last saved ${savedAgo < 1 ? 'just now' : `${savedAgo} min ago`}` : 'Using default settings'}</span>
      {dirty && <button type="button" className="k-btn k-btn-outline" onClick={() => { setDraft(settings); setEditingProfile(false); }}>Discard</button>}
      <button type="button" className="k-btn k-btn-primary" disabled={!dirty || editingProfile} onClick={() => saveSettings(draft)}><Icon name="check" size={18}/>Save Changes</button>
    </footer>
  </section>;
}
