import ScreenHeader from './ScreenHeader';

type QuickAction = {
  label: string;
  helper: string;
};

type ModulePlaceholderProps = {
  title: string;
  subtitle: string;
  quickActions: QuickAction[];
  safetyMessage?: string;
};

const ModulePlaceholder = ({
  title,
  subtitle,
  quickActions,
  safetyMessage
}: ModulePlaceholderProps) => {
  return (
    <section>
      <ScreenHeader title={title} subtitle={subtitle} />

      {safetyMessage ? (
        <div className="mb-6 rounded-2xl border border-[#e6c984] bg-[var(--status-warn)] p-5 text-lg text-[#5c3b00] sm:text-xl">
          <strong className="font-semibold">Safety Tip:</strong> {safetyMessage}
        </div>
      ) : null}

      <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Quick Actions
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left transition-colors hover:border-[var(--line-strong)]"
            >
              <span className="block text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
                {action.label}
              </span>
              <span className="mt-2 block text-lg leading-snug text-[var(--text-muted)] sm:text-xl">
                {action.helper}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulePlaceholder;
