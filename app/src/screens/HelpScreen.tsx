import { FormEvent, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';

const quickActions = [
  'Open my email',
  'Show my photos',
  'Help with printer',
  'Call support',
  'Is this email safe?',
  'Take me home'
];

const getSimpleResponse = (command: string): string => {
  const normalized = command.toLowerCase();

  if (normalized.includes('email') && normalized.includes('safe')) {
    return 'I can help check this email. Please do not click links until we review it together.';
  }

  if (normalized.includes('printer')) {
    return 'I can walk you through printer setup step by step. We can also call support if needed.';
  }

  if (normalized.includes('call support')) {
    return 'Support is ready. Tap the support button to start a call.';
  }

  if (normalized.includes('photos')) {
    return 'I can open your photos and show recent pictures first.';
  }

  return 'I can help with that. You can also tap Help options below for quick support.';
};

const HelpScreen = () => {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('Ask for help in plain words. Example: "Read this email".');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = command.trim();

    if (!trimmed) {
      return;
    }

    setResponse(getSimpleResponse(trimmed));
    setCommand('');
  };

  return (
    <section>
      <ScreenHeader
        title="Help"
        subtitle="Tell me what you need, and I will guide you in simple steps."
      />

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="help-command" className="block text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
            What do you need help with?
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="help-command"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="Example: Is this email safe?"
              className="w-full rounded-2xl border-2 border-[var(--line-soft)] px-5 py-4 text-xl text-[var(--text-strong)] placeholder:text-[#698074] sm:text-2xl"
            />
            <button
              type="submit"
              className="rounded-2xl border-2 border-[#2d5d42] bg-[#2d5d42] px-6 py-4 text-xl font-semibold text-white"
            >
              Get Help
            </button>
          </div>
        </form>
      </div>

      <div className="mb-6 rounded-2xl border border-[#aacfb1] bg-[var(--status-safe)] p-5 text-lg leading-relaxed text-[#154624] sm:text-xl">
        {response}
      </div>

      <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Quick Help Actions
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setResponse(getSimpleResponse(action))}
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left text-2xl font-semibold text-[var(--text-strong)] transition-colors hover:border-[var(--line-strong)] sm:text-3xl"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HelpScreen;
