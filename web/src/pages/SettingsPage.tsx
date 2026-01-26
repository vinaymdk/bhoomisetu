import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { badgePreferencesService } from '../services/badgePreferences.service';
import { notificationsService } from '../services/notifications.service';
import type { NotificationPreferences } from '../types/notification';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [savedBadge, setSavedBadge] = useState(true);
  const [listBadge, setListBadge] = useState(true);
  const [reqsBadge, setReqsBadge] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setSavedBadge(badgePreferencesService.get(user.id, 'saved'));
    setListBadge(badgePreferencesService.get(user.id, 'list'));
    setReqsBadge(badgePreferencesService.get(user.id, 'reqs'));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    notificationsService
      .getPreferences()
      .then((prefs) => {
        setNotificationPrefs(prefs);
        setPrefsError(null);
      })
      .catch((err) => setPrefsError(err?.message || 'Failed to load notification preferences.'));
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

  const updateNotificationPref = async (updates: Partial<NotificationPreferences>) => {
    try {
      const prefs = await notificationsService.updatePreferences(updates);
      setNotificationPrefs(prefs);
      setPrefsError(null);
    } catch (err: any) {
      setPrefsError(err?.message || 'Failed to update notification preferences.');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage how badges and counts appear across the app.</p>
      </div>

      <div className="settings-grid">
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

        <div className="settings-card">
          <h3>Notification Preferences</h3>
          {prefsError && <p className="settings-error">{prefsError}</p>}
          {!notificationPrefs ? (
            <p className="settings-helper">Loading notification preferences...</p>
          ) : (
            <>
              <div className="settings-toggle-row">
                <span>Push notifications</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.pushEnabled}
                  onChange={(e) => updateNotificationPref({ pushEnabled: e.target.checked })}
                />
              </div>
              <div className="settings-toggle-row">
                <span>SMS updates</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.smsEnabled}
                  onChange={(e) => updateNotificationPref({ smsEnabled: e.target.checked })}
                />
              </div>
              <div className="settings-toggle-row">
                <span>Email updates</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailEnabled}
                  onChange={(e) => updateNotificationPref({ emailEnabled: e.target.checked })}
                />
              </div>
              <div className="settings-divider" />
              <div className="settings-toggle-row">
                <span>Property matches</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.propertyMatchEnabled}
                  onChange={(e) => updateNotificationPref({ propertyMatchEnabled: e.target.checked })}
                />
              </div>
              <div className="settings-toggle-row">
                <span>Price drops</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.priceDropEnabled}
                  onChange={(e) => updateNotificationPref({ priceDropEnabled: e.target.checked })}
                />
              </div>
              <div className="settings-toggle-row">
                <span>Viewing reminders</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.viewingReminderEnabled}
                  onChange={(e) => updateNotificationPref({ viewingReminderEnabled: e.target.checked })}
                />
              </div>
              <div className="settings-toggle-row">
                <span>Mediation updates</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.mediationUpdateEnabled}
                  onChange={(e) => updateNotificationPref({ mediationUpdateEnabled: e.target.checked })}
                />
              </div>
              <div className="settings-toggle-row">
                <span>AI chat escalation</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs.aiChatEscalationEnabled}
                  onChange={(e) => updateNotificationPref({ aiChatEscalationEnabled: e.target.checked })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
