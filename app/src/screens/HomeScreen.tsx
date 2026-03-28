import HomeTile from '@/components/HomeTile';
import ScreenHeader from '@/components/ScreenHeader';
import { HOME_MODULES } from '@/lib/modules';
import { useUiStore } from '@/store/uiStore';

const HomeScreen = () => {
  const goTo = useUiStore((state) => state.goTo);

  return (
    <section>
      <ScreenHeader
        title="SeniorEase Desktop"
        subtitle="Choose what you want to do. You can always tap Help if you feel stuck."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {HOME_MODULES.map((module) => (
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
