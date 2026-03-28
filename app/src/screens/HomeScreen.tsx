import { useState } from 'react';
import HomeTile from '@/components/HomeTile';
import ScreenHeader from '@/components/ScreenHeader';
import { HOME_MODULES } from '@/lib/modules';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';

const addMinutes = (timeText: string, minutes: number): string => {
  const [hoursText, minutesText] = timeText.split(':');
  const hours = Number.parseInt(hoursText ?? '0', 10);
  const mins = Number.parseInt(minutesText ?? '0', 10);

  if (Number.isNaN(hours) || Number.isNaN(mins)) {
    return timeText;
  }

  const total = ((hours * 60 + mins + minutes) % (24 * 60) + 24 * 60) % (24 * 60);
  const nextHours = String(Math.floor(total / 60)).padStart(2, '0');
  const nextMinutes = String(total % 60).padStart(2, '0');
  return `${nextHours}:${nextMinutes}`;
};

const HomeScreen = () => {
  const goTo = useUiStore((state) => state.goTo);
  const config = useConfigStore((state) => state.config);
  const saveConfigPatch = useConfigStore((state) => state.saveConfigPatch);
  const allowedModules = config.allowedModules;
  const reminders = config.reminders;
  const visibleModules = HOME_MODULES.filter((module) => allowedModules[module.id]);
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  const markReminderDone = async (id: string) => {
    const nextReminders = reminders.filter((reminder) => reminder.id !== id);
    const saved = await saveConfigPatch({ reminders: nextReminders });
    setReminderNotice(saved ? 'Reminder marked done.' : 'Could not update reminder.');
  };

  const snoozeReminder = async (id: string) => {
    const nextReminders = reminders.map((reminder) =>
      reminder.id === id
        ? { ...reminder, dueAt: addMinutes(reminder.dueAt, 30) }
        : reminder
    );
    const saved = await saveConfigPatch({ reminders: nextReminders });
    setReminderNotice(saved ? 'Reminder snoozed by 30 minutes.' : 'Could not snooze reminder.');
  };

  return (
    <section>
      <ScreenHeader
        title="SeniorEase Desktop"
        subtitle="Choose what you want to do. You can always tap Help if you feel stuck."
      />

      <div className="mb-5 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-5">
        <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Today&apos;s Reminders
        </h2>

        {reminderNotice ? (
          <div className="mt-3 rounded-xl border border-[#9ac6a4] bg-[#dff2e5] p-3 text-lg text-[#174128] sm:text-xl">
            {reminderNotice}
          </div>
        ) : null}

        {reminders.length === 0 ? (
          <p className="mt-3 text-xl text-[var(--text-muted)] sm:text-2xl">No reminders right now.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reminders.slice(0, 3).map((reminder) => (
              <article
                key={reminder.id}
                className="grid gap-3 rounded-2xl border border-[var(--line-soft)] bg-white p-4 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
                    {reminder.text}
                  </p>
                  <p className="mt-1 text-lg text-[var(--text-muted)] sm:text-xl">Time: {reminder.dueAt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void snoozeReminder(reminder.id);
                  }}
                  className="rounded-xl border-2 border-[var(--line-strong)] bg-white px-4 py-2 text-lg font-semibold text-[var(--text-strong)]"
                >
                  Snooze 30m
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void markReminderDone(reminder.id);
                  }}
                  className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-2 text-lg font-semibold text-white"
                >
                  Mark Done
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleModules.length === 0 ? (
          <article className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 md:col-span-2">
            <p className="text-2xl text-[var(--text-muted)] sm:text-3xl">
              No modules are enabled right now. Open Admin Settings to restore access.
            </p>
          </article>
        ) : null}
        {visibleModules.map((module) => (
          <HomeTile key={module.id} module={module} onSelect={goTo} />
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => goTo('settings')}
          className="w-full rounded-2xl border-2 border-[var(--line-strong)] bg-white px-6 py-4 text-left text-2xl font-semibold text-[var(--text-strong)] transition-colors hover:bg-[#f4f8f3] sm:text-3xl"
        >
          Admin Settings
          <span className="mt-1 block text-lg font-normal text-[var(--text-muted)] sm:text-xl">
            Manage reminders, favorites, contacts, and safety preferences.
          </span>
        </button>
      </div>
    </section>
  );
};

export default HomeScreen;
