import { FormEvent, useState } from 'react';
import AssistantResponseCard from '@/components/AssistantResponseCard';
import ScreenHeader from '@/components/ScreenHeader';
import { sendAssistantCommand } from '@/lib/assistantClient';
import { useUiStore } from '@/store/uiStore';
import type { AssistantAction, AssistantCommandResponse } from '@/types/assistant';

const quickActions = [
  'Open my email',
  'Read this email',
  'Show my photos',
  'Is this safe?',
  'Call support'
];

const starterResponse: AssistantCommandResponse = {
  success: true,
  message: 'Ask for help in plain words. Example: "Open my email".',
  riskLevel: 'safe',
  actions: [
    {
      id: 'open_email',
      label: 'Open My Email',
      description: 'Go to your inbox.'
    },
    {
      id: 'show_photos',
      label: 'Show My Photos',
      description: 'View your recent pictures.'
    }
  ]
};

const HelpScreen = () => {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState<AssistantCommandResponse>(starterResponse);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const goTo = useUiStore((state) => state.goTo);
  const goHome = useUiStore((state) => state.goHome);

  const requestCommand = async (nextCommand: string) => {
    const trimmed = nextCommand.trim();

    if (!trimmed) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await sendAssistantCommand({
        userId: 'local-user-1',
        sessionId: 'phase2-session',
        command: trimmed,
        context: { screen: 'help' }
      });

      setResponse(result);
      setCommand('');
    } catch {
      setErrorMessage('Bridge service is unavailable. Please start the local bridge and try again.');
      setResponse({
        success: true,
        message: 'I cannot reach support services right now. You can still use quick actions while reconnecting.',
        riskLevel: 'caution',
        actions: [
          {
            id: 'open_email',
            label: 'Open My Email',
            description: 'Continue with local navigation.'
          },
          {
            id: 'show_photos',
            label: 'Show My Photos',
            description: 'Continue with local navigation.'
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void requestCommand(command);
  };

  const handleAction = (action: AssistantAction) => {
    if (action.id === 'open_email') {
      goTo('email');
      return;
    }

    if (action.id === 'show_photos' || action.id === 'open_photos' || action.id === 'start_slideshow') {
      goTo('photos');
      return;
    }

    if (action.id === 'go_home') {
      goHome();
      return;
    }

    void requestCommand(action.label);
  };

  return (
    <section>
      <ScreenHeader
        title="Help"
        subtitle="Tell me what you need, and I will guide you with safe next steps."
      />

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="help-command"
            className="block text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl"
          >
            What do you need help with?
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="help-command"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="Example: Is this safe?"
              className="w-full rounded-2xl border-2 border-[var(--line-soft)] px-5 py-4 text-xl text-[var(--text-strong)] placeholder:text-[#698074] sm:text-2xl"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="rounded-2xl border-2 border-[#2d5d42] bg-[#2d5d42] px-6 py-4 text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Get Help'}
            </button>
          </div>
        </form>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-[#d7be7f] bg-[#fff2ce] p-4 text-lg text-[#5c3b00] sm:text-xl">
          {errorMessage}
        </div>
      ) : null}

      <div className="mb-6">
        <AssistantResponseCard response={response} loading={isLoading} onAction={handleAction} />
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
              onClick={() => {
                void requestCommand(action);
              }}
              disabled={isLoading}
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left text-2xl font-semibold text-[var(--text-strong)] transition-colors hover:border-[var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-3xl"
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
