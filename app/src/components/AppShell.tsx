import { useEffect, useMemo, useState } from 'react';
import BottomNav from './BottomNav';
import { fetchCurrentWeather } from '@/lib/weatherClient';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';
import type { CurrentWeather } from '@/types/weather';

type AppShellProps = {
  children: React.ReactNode;
};

const getGreeting = (hours: number): string => {
  if (hours < 12) {
    return 'Good morning';
  }

  if (hours < 18) {
    return 'Good afternoon';
  }

  return 'Good evening';
};

const AppShell = ({ children }: AppShellProps) => {
  const [now, setNow] = useState(() => new Date());
  const reminderCount = useUiStore((state) => state.reminderCount);
  const assistantNote = useUiStore((state) => state.assistantNote);
  const clearAssistantNote = useUiStore((state) => state.clearAssistantNote);
  const configError = useConfigStore((state) => state.errorMessage);
  const reminders = useConfigStore((state) => state.config.reminders);
  const safetyMode = useConfigStore((state) => state.config.safetyMode);
  const weatherZipCode = useConfigStore((state) => state.config.weatherZipCode);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const greeting = useMemo(() => getGreeting(now.getHours()), [now]);

  const formattedDate = useMemo(
    () =>
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
    [now]
  );

  const formattedTime = useMemo(
    () =>
      now.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      }),
    [now]
  );

  useEffect(() => {
    let canceled = false;

    const loadWeather = async () => {
      if (!/^\d{5}$/.test(weatherZipCode)) {
        if (!canceled) {
          setWeather(null);
          setWeatherError('Set weather ZIP code in Settings.');
        }
        return;
      }

      if (!canceled) {
        setWeatherLoading(true);
        setWeatherError(null);
      }

      try {
        const current = await fetchCurrentWeather(weatherZipCode);

        if (!canceled) {
          setWeather(current);
          setWeatherError(null);
        }
      } catch {
        if (!canceled) {
          setWeather(null);
          setWeatherError('Weather unavailable right now.');
        }
      } finally {
        if (!canceled) {
          setWeatherLoading(false);
        }
      }
    };

    void loadWeather();
    const interval = window.setInterval(() => {
      void loadWeather();
    }, 15 * 60 * 1000);

    return () => {
      canceled = true;
      window.clearInterval(interval);
    };
  }, [weatherZipCode]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(114,155,117,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(236,184,101,0.2),transparent_34%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="px-5 pt-5 sm:px-8 sm:pt-8">
          <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-[var(--font-display)] text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
                  {greeting}
                </p>
                <p className="mt-2 text-xl text-[var(--text-muted)] sm:text-2xl">{formattedDate}</p>
              </div>
              <div className="grid gap-2 text-left sm:text-right">
                <p className="text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">{formattedTime}</p>
                <p className="text-lg text-[var(--text-muted)] sm:text-xl">
                  {weatherLoading
                    ? 'Loading weather...'
                    : weatherError
                      ? weatherError
                      : weather
                        ? `${weather.city}, ${weather.state} (${weather.zip}) - ${weather.temperatureF}°F, ${weather.condition}`
                        : 'Weather unavailable'}
                </p>
                <p className="text-lg text-[var(--text-muted)] sm:text-xl">
                  {reminderCount > 0
                    ? `${reminderCount} reminder${reminderCount > 1 ? 's' : ''} today`
                    : 'No reminders today'}
                </p>
                {reminders.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {reminders.slice(0, 2).map((reminder) => (
                      <p key={reminder.id} className="text-base text-[var(--text-muted)] sm:text-lg">
                        {reminder.dueAt} - {reminder.text}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {assistantNote ? (
          <div className="px-5 pt-4 sm:px-8">
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-[#aacfb1] bg-[var(--status-safe)] p-4 text-lg text-[#154624] sm:text-xl">
              <p>{assistantNote}</p>
              <button
                type="button"
                onClick={clearAssistantNote}
                className="shrink-0 rounded-xl border border-[#6da67a] bg-white px-3 py-1.5 text-base font-semibold text-[#1b4a27]"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}

        <div className="px-5 pt-4 sm:px-8">
          <div
            className={`rounded-2xl border p-3 text-lg font-semibold sm:text-xl ${
              safetyMode === 'strict'
                ? 'border-[#de9d9d] bg-[#fde4e4] text-[#6a1f1f]'
                : 'border-[#aacfb1] bg-[#dff2e5] text-[#174128]'
            }`}
          >
            Safety Mode: {safetyMode === 'strict' ? 'Strict (extra protections on)' : 'Standard'}
          </div>
        </div>

        {configError ? (
          <div className="px-5 pt-4 sm:px-8">
            <div className="rounded-2xl border border-[#d7be7f] bg-[#fff2ce] p-4 text-lg text-[#614000] sm:text-xl">
              {configError}
            </div>
          </div>
        ) : null}

        <main className="flex-1 px-5 pb-28 pt-5 sm:px-8 sm:pt-7">{children}</main>

        <BottomNav />
      </div>
    </div>
  );
};

export default AppShell;
