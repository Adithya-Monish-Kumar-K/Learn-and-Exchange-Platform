import React, { useEffect, useMemo, useState } from 'react';
import { Save, Download, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import apiClient from '../services/apiClient';
import { toast } from 'react-hot-toast';

type Visibility = 'public' | 'private' | 'team_only';

type Preferences = {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    profileVisibility: Visibility;
  };
};

const DEFAULT_PREFS: Preferences = {
  theme: 'light',
  notifications: { email: true, push: false },
  privacy: { profileVisibility: 'public' },
};

const STORAGE_KEY = 'app:settings';

const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const user = useMemo(() => apiClient.getUser?.(), []);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Preferences;
        setPrefs(parsed);
        // Align theme to stored preference if different from current
        const shouldBeDark = parsed.theme === 'dark';
        if (shouldBeDark !== !!isDark) toggleTheme();
      } else {
        // Initialize from theme context if no stored prefs
        setPrefs((p) => ({ ...p, theme: isDark ? 'dark' : 'light' }));
      }
    } catch {
      // Fallback to defaults
      setPrefs((p) => ({ ...p, theme: isDark ? 'dark' : 'light' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeTheme = (value: 'light' | 'dark') => {
    setPrefs((p) => ({ ...p, theme: value }));
    const shouldBeDark = value === 'dark';
    if (shouldBeDark !== !!isDark) toggleTheme();
  };

  const onSave = () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      toast.success('Settings saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setPrefs(DEFAULT_PREFS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFS));
    if (isDark && DEFAULT_PREFS.theme === 'light') toggleTheme();
    if (!isDark && DEFAULT_PREFS.theme === 'dark') toggleTheme();
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Settings
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
              Manage your appearance, notifications, and privacy preferences.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors border"
              style={{
                background: 'var(--card-background)',
                color: 'var(--text-primary)',
                borderColor: 'var(--card-border)',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              style={{ background: 'var(--info)', color: '#fff' }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance */}
          <section
            className="rounded-xl shadow-sm p-6"
            style={{
              background: 'var(--card-background)',
              border: '1px solid var(--card-border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Appearance
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={prefs.theme === 'light'}
                  onChange={() => onChangeTheme('light')}
                />
                <span style={{ color: 'var(--text-secondary)' }}>Light</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={prefs.theme === 'dark'}
                  onChange={() => onChangeTheme('dark')}
                />
                <span style={{ color: 'var(--text-secondary)' }}>Dark</span>
              </label>
            </div>
          </section>

          {/* Account */}
          <section
            className="rounded-xl shadow-sm p-6"
            style={{
              background: 'var(--card-background)',
              border: '1px solid var(--card-border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Account
            </h2>
            {user ? (
              <div
                className="space-y-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                <p>
                  <span
                    className="font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Name:
                  </span>{' '}
                  {user.name}
                </p>
                <p>
                  <span
                    className="font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Email:
                  </span>{' '}
                  {user.email}
                </p>
                {user.phone && (
                  <p>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Phone:
                    </span>{' '}
                    {user.phone}
                  </p>
                )}
                {user.role && (
                  <p>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Role:
                    </span>{' '}
                    {user.role}
                  </p>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Not logged in.</p>
            )}
          </section>

          {/* Notifications */}
          <section
            className="rounded-xl shadow-sm p-6"
            style={{
              background: 'var(--card-background)',
              border: '1px solid var(--card-border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.notifications.email}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      notifications: {
                        ...p.notifications,
                        email: e.target.checked,
                      },
                    }))
                  }
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Email updates
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.notifications.push}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      notifications: {
                        ...p.notifications,
                        push: e.target.checked,
                      },
                    }))
                  }
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Push notifications
                </span>
              </label>
            </div>
          </section>

          {/* Privacy */}
          <section
            className="rounded-xl shadow-sm p-6"
            style={{
              background: 'var(--card-background)',
              border: '1px solid var(--card-border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Privacy
            </h2>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Profile visibility
            </label>
            <select
              value={prefs.privacy.profileVisibility}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  privacy: { profileVisibility: e.target.value as Visibility },
                }))
              }
              className="form-select"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="team_only">Team only</option>
            </select>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
