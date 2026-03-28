import { FormEvent, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';

const urlLikePattern = /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

type StatusTone = 'safe' | 'caution' | 'blocked';

const toneClasses: Record<StatusTone, string> = {
  safe: 'border-[#9ac6a4] bg-[#dff2e5] text-[#174128]',
  caution: 'border-[#d7be7f] bg-[#fff2ce] text-[#614000]',
  blocked: 'border-[#de9d9d] bg-[#fde4e4] text-[#6a1f1f]'
};

const InternetScreen = () => {
  const trustedFavorites = useConfigStore((state) => state.config.internetFavorites);
  const safetyMode = useConfigStore((state) => state.config.safetyMode);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<{ tone: StatusTone; message: string }>({
    tone: 'caution',
    message: 'Unknown websites can be risky. If unsure, tap Help first.'
  });

  const openSearch = (value: string) => {
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(value)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    const looksLikeUrl = urlLikePattern.test(trimmed);

    if (looksLikeUrl && safetyMode === 'strict') {
      setStatus({
        tone: 'blocked',
        message:
          'Strict safety mode blocked direct website entry. Use trusted favorites or ask for help.'
      });
      return;
    }

    if (looksLikeUrl) {
      const approved = window.confirm('This looks like a direct website. Open it now?');

      if (!approved) {
        setStatus({
          tone: 'caution',
          message: 'Canceled. You can use trusted favorites or ask for help.'
        });
        return;
      }

      const target = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      window.open(target, '_blank', 'noopener,noreferrer');
      setStatus({
        tone: 'safe',
        message: 'Website opened in your browser.'
      });
      return;
    }

    openSearch(trimmed);
    setStatus({
      tone: 'safe',
      message: 'Search opened in your browser.'
    });
  };

  const handleFavoriteOpen = (favorite: string) => {
    openSearch(favorite);
    setStatus({
      tone: 'safe',
      message: `Opened favorite: ${favorite}`
    });
  };

  return (
    <section>
      <ScreenHeader
        title="Internet"
        subtitle="Use favorites or type what you want to find in large print."
      />

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <form onSubmit={handleSearch} className="space-y-3">
          <label htmlFor="internet-search" className="block text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
            Search or website address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="internet-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: weather near me"
              className="w-full rounded-2xl border-2 border-[var(--line-soft)] px-5 py-4 text-xl text-[var(--text-strong)] placeholder:text-[#698074] sm:text-2xl"
            />
            <button
              type="submit"
              className="rounded-2xl border-2 border-[#2d5d42] bg-[#2d5d42] px-6 py-4 text-xl font-semibold text-white"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className={`mb-6 rounded-2xl border p-5 text-lg sm:text-xl ${toneClasses[status.tone]}`}>
        <strong className="font-semibold">Safety Tip:</strong> {status.message}
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
              onClick={() => handleFavoriteOpen(favorite)}
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
