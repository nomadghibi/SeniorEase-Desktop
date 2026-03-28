import type { AssistantAction, AssistantCommandResponse } from '@/types/assistant';

type AssistantResponseCardProps = {
  response: AssistantCommandResponse;
  loading?: boolean;
  onAction: (action: AssistantAction) => void;
};

const riskStyles = {
  safe: {
    label: 'Safe',
    banner: 'border-[#9ac6a4] bg-[#dff2e5] text-[#174128]'
  },
  caution: {
    label: 'Caution',
    banner: 'border-[#d7be7f] bg-[#fff2ce] text-[#614000]'
  },
  blocked: {
    label: 'Blocked',
    banner: 'border-[#de9d9d] bg-[#fde4e4] text-[#6a1f1f]'
  }
} as const;

const AssistantResponseCard = ({
  response,
  loading = false,
  onAction
}: AssistantResponseCardProps) => {
  const risk = riskStyles[response.riskLevel];

  return (
    <article className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Assistant Response
        </h2>
        <span
          className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-lg font-semibold sm:text-xl ${risk.banner}`}
        >
          Risk Level: {risk.label}
        </span>
      </header>

      <p className="text-xl leading-relaxed text-[var(--text-strong)] sm:text-2xl">{response.message}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {response.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action)}
            disabled={loading}
            className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left transition-colors hover:border-[var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="block text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
              {action.label}
            </span>
            <span className="mt-1 block text-lg leading-snug text-[var(--text-muted)] sm:text-xl">
              {action.description}
              {action.requiresConfirmation ? ' Confirmation required.' : ''}
            </span>
          </button>
        ))}
      </div>
    </article>
  );
};

export default AssistantResponseCard;
