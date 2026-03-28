import { FormEvent, useEffect, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { closeSupportLog, fetchSupportLogs } from '@/lib/supportClient';
import { useAdminStore } from '@/store/adminStore';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';
import type { AppConfig, FamilyContact, Reminder } from '@/types/config';
import type { SupportLogEntry } from '@/types/support';

const createId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

const managedModuleLabels: Array<{
  key: keyof AppConfig['allowedModules'];
  label: string;
  locked?: boolean;
}> = [
  { key: 'email', label: 'Email' },
  { key: 'photos', label: 'Photos' },
  { key: 'internet', label: 'Internet' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'videocall', label: 'Video Call' },
  { key: 'family', label: 'Family' },
  { key: 'help', label: 'Help', locked: true },
  { key: 'settings', label: 'Settings', locked: true }
];

const SettingsScreen = () => {
  const config = useConfigStore((state) => state.config);
  const isLoading = useConfigStore((state) => state.isLoading);
  const isSaving = useConfigStore((state) => state.isSaving);
  const saveConfigPatch = useConfigStore((state) => state.saveConfigPatch);
  const loadConfig = useConfigStore((state) => state.loadConfig);
  const lockSettings = useAdminStore((state) => state.lockSettings);
  const goHome = useUiStore((state) => state.goHome);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [contacts, setContacts] = useState<FamilyContact[]>([]);
  const [supportContactName, setSupportContactName] = useState('');
  const [safetyMode, setSafetyMode] = useState<'standard' | 'strict'>('standard');
  const [requireAdminPin, setRequireAdminPin] = useState(true);
  const [newAdminPin, setNewAdminPin] = useState('');
  const [allowedModules, setAllowedModules] = useState<AppConfig['allowedModules']>(config.allowedModules);
  const [supportLogs, setSupportLogs] = useState<SupportLogEntry[]>([]);
  const [supportLogsLoading, setSupportLogsLoading] = useState(false);
  const [closingLogId, setClosingLogId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setReminders(config.reminders.map((item) => ({ ...item })));
    setFavorites([...config.internetFavorites]);
    setContacts(config.familyContacts.map((item) => ({ ...item })));
    setSupportContactName(config.supportContactName);
    setSafetyMode(config.safetyMode);
    setRequireAdminPin(config.requireAdminPin);
    setAllowedModules({ ...config.allowedModules });
  }, [config]);

  const refreshSupportLogs = async () => {
    setSupportLogsLoading(true);
    try {
      const result = await fetchSupportLogs(10);
      setSupportLogs(result.logs);
    } catch {
      setSupportLogs([]);
    } finally {
      setSupportLogsLoading(false);
    }
  };

  useEffect(() => {
    void refreshSupportLogs();
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newAdminPin.length > 0 && !/^\d{4,8}$/.test(newAdminPin)) {
      setStatusMessage('Admin PIN must be 4 to 8 digits.');
      return;
    }

    const nextReminders = reminders
      .map((item) => ({
        id: item.id || createId('reminder'),
        text: item.text.trim(),
        dueAt: item.dueAt.trim() || '09:00'
      }))
      .filter((item) => item.text.length > 0);

    const nextFavorites = favorites.map((item) => item.trim()).filter((item) => item.length > 0);

    const nextContacts = contacts
      .map((item) => ({
        id: item.id || createId('contact'),
        name: item.name.trim(),
        relation: item.relation.trim(),
        email: item.email?.trim() || undefined,
        phone: item.phone?.trim() || undefined
      }))
      .filter((item) => item.name.length > 0 && item.relation.length > 0);

    const saved = await saveConfigPatch({
      reminders: nextReminders,
      internetFavorites: nextFavorites,
      familyContacts: nextContacts,
      supportContactName: supportContactName.trim() || 'Support',
      safetyMode,
      requireAdminPin,
      adminPin: newAdminPin.length > 0 ? newAdminPin : config.adminPin,
      allowedModules: {
        ...allowedModules,
        help: true,
        settings: true
      }
    });

    setStatusMessage(saved ? 'Settings saved.' : 'Could not save settings right now.');
    if (saved) {
      setNewAdminPin('');
    }
  };

  const handleCloseSupportLog = async (id: string) => {
    setClosingLogId(id);
    try {
      await closeSupportLog(id);
      await refreshSupportLogs();
    } finally {
      setClosingLogId(null);
    }
  };

  return (
    <section>
      <ScreenHeader
        title="Settings"
        subtitle="For support persons: update favorites, reminders, contacts, and safety controls."
      />

      <div className="mb-6 rounded-2xl border border-[#d7be7f] bg-[#fff2ce] p-4 text-lg text-[#614000] sm:text-xl">
        Admin area: make changes carefully. The senior user experience updates after saving.
      </div>

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-[#9ac6a4] bg-[#dff2e5] p-4 text-lg text-[#174128] sm:text-xl">
          {statusMessage}
        </div>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">Reminders</h2>
            <button
              type="button"
              onClick={() =>
                setReminders((current) => [
                  ...current,
                  { id: createId('reminder'), text: '', dueAt: '09:00' }
                ])
              }
              className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-2 text-lg font-semibold text-white"
            >
              Add Reminder
            </button>
          </div>

          <div className="space-y-3">
            {reminders.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-2xl border border-[var(--line-soft)] bg-white p-4 md:grid-cols-[1fr_150px_auto]">
                <input
                  value={item.text}
                  onChange={(event) =>
                    setReminders((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, text: event.target.value } : entry
                      )
                    )
                  }
                  placeholder="Reminder text"
                  className="rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
                />
                <input
                  type="time"
                  value={item.dueAt}
                  onChange={(event) =>
                    setReminders((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, dueAt: event.target.value } : entry
                      )
                    )
                  }
                  className="rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setReminders((current) => current.filter((_, entryIndex) => entryIndex !== index))
                  }
                  className="rounded-xl border-2 border-[#a44343] bg-[#a44343] px-4 py-3 text-lg font-semibold text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">Internet Favorites</h2>
            <button
              type="button"
              onClick={() => setFavorites((current) => [...current, ''])}
              className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-2 text-lg font-semibold text-white"
            >
              Add Favorite
            </button>
          </div>
          <div className="space-y-3">
            {favorites.map((favorite, index) => (
              <div key={`${favorite}-${index}`} className="grid gap-3 rounded-2xl border border-[var(--line-soft)] bg-white p-4 md:grid-cols-[1fr_auto]">
                <input
                  value={favorite}
                  onChange={(event) =>
                    setFavorites((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? event.target.value : entry
                      )
                    )
                  }
                  placeholder="Favorite website label"
                  className="rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
                />
                <button
                  type="button"
                  onClick={() => setFavorites((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                  className="rounded-xl border-2 border-[#a44343] bg-[#a44343] px-4 py-3 text-lg font-semibold text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">Family Contacts</h2>
            <button
              type="button"
              onClick={() =>
                setContacts((current) => [
                  ...current,
                  {
                    id: createId('contact'),
                    name: '',
                    relation: ''
                  }
                ])
              }
              className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-2 text-lg font-semibold text-white"
            >
              Add Contact
            </button>
          </div>

          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div key={contact.id} className="space-y-3 rounded-2xl border border-[var(--line-soft)] bg-white p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={contact.name}
                    onChange={(event) =>
                      setContacts((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, name: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="Name"
                    className="rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
                  />
                  <input
                    value={contact.relation}
                    onChange={(event) =>
                      setContacts((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, relation: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="Relation"
                    className="rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={contact.email ?? ''}
                    onChange={(event) =>
                      setContacts((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, email: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="Email (optional)"
                    className="rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
                  />
                  <input
                    value={contact.phone ?? ''}
                    onChange={(event) =>
                      setContacts((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, phone: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="Phone (optional)"
                    className="rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setContacts((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                  className="rounded-xl border-2 border-[#a44343] bg-[#a44343] px-4 py-3 text-lg font-semibold text-white"
                >
                  Remove Contact
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">Safety and Support</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">Support Contact Name</span>
              <input
                value={supportContactName}
                onChange={(event) => setSupportContactName(event.target.value)}
                className="w-full rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">Safety Mode</span>
              <select
                value={safetyMode}
                onChange={(event) => setSafetyMode(event.target.value as 'standard' | 'strict')}
                className="w-full rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
              >
                <option value="standard">Standard</option>
                <option value="strict">Strict</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">
                Require Admin PIN
              </span>
              <select
                value={requireAdminPin ? 'yes' : 'no'}
                onChange={(event) => setRequireAdminPin(event.target.value === 'yes')}
                className="w-full rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl text-[var(--text-strong)]"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">
                Set New Admin PIN
              </span>
              <input
                type="password"
                inputMode="numeric"
                value={newAdminPin}
                onChange={(event) =>
                  setNewAdminPin(event.target.value.replace(/[^\d]/g, '').slice(0, 8))
                }
                placeholder="Leave blank to keep current PIN"
                className="w-full rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-xl tracking-[0.2em] text-[var(--text-strong)]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
            Module Visibility
          </h2>
          <p className="mb-4 text-xl text-[var(--text-muted)] sm:text-2xl">
            Turn modules on or off for the senior home screen.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {managedModuleLabels.map((module) => (
              <label
                key={module.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3"
              >
                <span className="text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">{module.label}</span>
                <input
                  type="checkbox"
                  checked={allowedModules[module.key]}
                  disabled={module.locked}
                  onChange={(event) =>
                    setAllowedModules((current) => ({
                      ...current,
                      [module.key]: event.target.checked
                    }))
                  }
                  className="h-6 w-6 accent-[#2d5d42] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
              Support Activity
            </h2>
            <button
              type="button"
              onClick={() => {
                void refreshSupportLogs();
              }}
              className="rounded-xl border-2 border-[var(--line-strong)] bg-white px-4 py-2 text-lg font-semibold text-[var(--text-strong)]"
            >
              Refresh
            </button>
          </div>

          {supportLogsLoading ? (
            <p className="text-xl text-[var(--text-muted)] sm:text-2xl">Loading support activity...</p>
          ) : null}

          {!supportLogsLoading && supportLogs.length === 0 ? (
            <p className="text-xl text-[var(--text-muted)] sm:text-2xl">No support tickets yet.</p>
          ) : null}

          <div className="space-y-3">
            {supportLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-2xl border border-[var(--line-soft)] bg-white p-4"
              >
                <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">{log.reason}</p>
                <p className="mt-1 text-lg text-[var(--text-muted)] sm:text-xl">
                  {new Date(log.createdAt).toLocaleString()} • Risk: {log.riskLevel ?? 'safe'} • Status: {log.status}
                </p>
                {log.status === 'open' ? (
                  <button
                    type="button"
                    onClick={() => {
                      void handleCloseSupportLog(log.id);
                    }}
                    disabled={closingLogId === log.id}
                    className="mt-3 rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-2 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {closingLogId === log.id ? 'Closing...' : 'Mark Closed'}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="rounded-2xl border-2 border-[#2d5d42] bg-[#2d5d42] px-6 py-3 text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setStatusMessage(null);
              void loadConfig();
            }}
            className="rounded-2xl border-2 border-[var(--line-strong)] bg-white px-6 py-3 text-xl font-semibold text-[var(--text-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reload from Server
          </button>
          <button
            type="button"
            onClick={() => {
              lockSettings();
              goHome();
            }}
            className="rounded-2xl border-2 border-[#315740] bg-[#315740] px-6 py-3 text-xl font-semibold text-white"
          >
            Lock Settings
          </button>
        </div>
      </form>
    </section>
  );
};

export default SettingsScreen;
