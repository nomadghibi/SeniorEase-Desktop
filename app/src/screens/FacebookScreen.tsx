import { useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';

const facebookActions = [
  {
    id: 'open-home',
    label: 'Open Facebook Home',
    description: 'Go to your Facebook home page.',
    url: 'https://www.facebook.com/'
  },
  {
    id: 'open-messages',
    label: 'Open Messages',
    description: 'Check your private messages.',
    url: 'https://www.facebook.com/messages/'
  },
  {
    id: 'open-notifications',
    label: 'Open Notifications',
    description: 'Review your alerts and updates.',
    url: 'https://www.facebook.com/notifications/'
  },
  {
    id: 'open-family-feed',
    label: 'See Family Posts',
    description: 'View the people and pages you follow.',
    url: 'https://www.facebook.com/?filter=all&sk=h_chr'
  }
];

const suspiciousHints = [
  'Someone asks for gift cards or money',
  'A message asks for your password',
  'A new account claims to be family but feels unusual',
  'A link says urgent account problem'
];

const FacebookScreen = () => {
  const supportContactName = useConfigStore((state) => state.config.supportContactName);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const openFacebookTarget = (label: string, url: string) => {
    const approved = window.confirm(`Open: ${label}?`);

    if (!approved) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    setStatusMessage(`${label} opened.`);
  };

  const handleSuspiciousFlow = () => {
    const approved = window.confirm(
      `Would you like to contact ${supportContactName} before taking action?`
    );

    if (!approved) {
      setStatusMessage('No problem. Stay cautious and avoid links or payments.');
      return;
    }

    setStatusMessage(`${supportContactName} has been selected as your support contact.`);
  };

  return (
    <section>
      <ScreenHeader
        title="Facebook"
        subtitle="Open Facebook with easy controls and stay safe from scams."
      />

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-[#9ac6a4] bg-[#dff2e5] p-4 text-lg text-[#174128] sm:text-xl">
          {statusMessage}
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl border border-[#de9d9d] bg-[#fde4e4] p-5 text-lg text-[#6a1f1f] sm:text-xl">
        <strong className="font-semibold">Safety Warning:</strong> Never send money, passwords, or card details through Facebook messages.
      </div>

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Quick Facebook Actions
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {facebookActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => openFacebookTarget(action.label, action.url)}
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left transition-colors hover:border-[var(--line-strong)]"
            >
              <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">{action.label}</p>
              <p className="mt-2 text-lg text-[var(--text-muted)] sm:text-xl">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Check If Something Looks Wrong
        </h2>

        <div className="mb-4 space-y-2">
          {suspiciousHints.map((hint) => (
            <p key={hint} className="text-xl text-[var(--text-muted)] sm:text-2xl">
              • {hint}
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSuspiciousFlow}
          className="rounded-2xl border-2 border-[#8a5b18] bg-[#8a5b18] px-6 py-3 text-xl font-semibold text-white"
        >
          This Looks Suspicious
        </button>
      </div>
    </section>
  );
};

export default FacebookScreen;
