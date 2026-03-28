import HomeTile from '@/components/HomeTile';
import ScreenHeader from '@/components/ScreenHeader';
import { HOME_MODULES } from '@/lib/modules';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';

const HomeScreen = () => {
  const goTo = useUiStore((state) => state.goTo);
  const allowedModules = useConfigStore((state) => state.config.allowedModules);
  const visibleModules = HOME_MODULES.filter((module) => allowedModules[module.id]);

  return (
    <section>
      <ScreenHeader
        title="SeniorEase Desktop"
        subtitle="Choose what you want to do. You can always tap Help if you feel stuck."
      />

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
