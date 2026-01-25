import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { badgePreferencesService } from '../services/badgePreferences.service';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [savedBadge, setSavedBadge] = useState(true);
  const [listBadge, setListBadge] = useState(true);
  const [reqsBadge, setReqsBadge] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setSavedBadge(badgePreferencesService.get(user.id, 'saved'));
    setListBadge(badgePreferencesService.get(user.id, 'list'));
    setReqsBadge(badgePreferencesService.get(user.id, 'reqs'));
  }, [user?.id]);

  if (!user) {
    return <div className="settings-page">Login to view settings.</div>;
  }

  const handleToggle = (key: 'saved' | 'list' | 'reqs', value: boolean) => {
    badgePreferencesService.set(user.id, key, value);
    window.dispatchEvent(new Event('badgePrefsChanged'));
    if (key === 'saved') setSavedBadge(value);
    if (key === 'list') setListBadge(value);
    if (key === 'reqs') setReqsBadge(value);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage how badges and counts appear across the app.</p>
      </div>

      <div className="settings-card">
        <h3>Badge Preferences</h3>
        <div className="settings-toggle-row">
          <span>Show Saved Count</span>
          <input
            type="checkbox"
            checked={savedBadge}
            onChange={(e) => handleToggle('saved', e.target.checked)}
          />
        </div>
        <div className="settings-toggle-row">
          <span>Show Listings Count</span>
          <input
            type="checkbox"
            checked={listBadge}
            onChange={(e) => handleToggle('list', e.target.checked)}
          />
        </div>
        <div className="settings-toggle-row">
          <span>Show Requirements Count</span>
          <input
            type="checkbox"
            checked={reqsBadge}
            onChange={(e) => handleToggle('reqs', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};
