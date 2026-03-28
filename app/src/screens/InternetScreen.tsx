import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';

const InternetScreen = () => {
  const trustedFavorites = useConfigStore((state) => state.config.internetFavorites);

  return (
    <section>
      <ScreenHeader
        title="Internet"
        subtitle="Use favorites or type what you want to find in large print."
      />

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <label htmlFor="internet-search" className="mb-3 block text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
          Search or website address
        </label>
        <input
          id="internet-search"
          type="text"
          placeholder="Example: weather near me"
          className="w-full rounded-2xl border-2 border-[var(--line-soft)] px-5 py-4 text-xl text-[var(--text-strong)] placeholder:text-[#698074] sm:text-2xl"
        />
      </div>

      <div className="mb-6 rounded-2xl border border-[#e6c984] bg-[var(--status-warn)] p-5 text-lg text-[#5c3b00] sm:text-xl">
        <strong className="font-semibold">Safety Tip:</strong> Unknown websites can be risky. If unsure, tap Help first.
      </div>

      <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">Favorite Websites</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {trustedFavorites.length === 0 ? (
            <p className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-5 text-2xl text-[var(--text-muted)] sm:text-3xl md:col-span-2">
              No favorites are configured yet.
            </p>
          ) : null}
          {trustedFavorites.map((favorite) => (
            <button
              key={favorite}
              type="button"
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-5 text-left text-2xl font-semibold text-[var(--text-strong)] transition-colors hover:border-[var(--line-strong)] sm:text-3xl"
            >
              {favorite}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InternetScreen;
