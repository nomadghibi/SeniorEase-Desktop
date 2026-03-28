import { FormEvent, useEffect, useMemo, useState } from 'react';
import AssistantResponseCard from '@/components/AssistantResponseCard';
import ScreenHeader from '@/components/ScreenHeader';
import { sendAssistantCommand } from '@/lib/assistantClient';
import { fetchSupportLogs, requestSupport } from '@/lib/supportClient';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';
import type { AssistantAction, AssistantCommandResponse } from '@/types/assistant';
import type { SupportLogEntry } from '@/types/support';

const baseQuickActions = [
  'Open my email',
  'Open internet',
  'Open Facebook',
  'Open video call',
  'Open family',
  'Read this email',
  'Show my photos',
  'Take me to my church website',
  'Help with printer',
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
    },
    {
      id: 'open_family',
      label: 'Open Family',
      description: 'Go to family contacts.'
    }
  ]
};

const HelpScreen = () => {
  const supportContactName = useConfigStore((state) => state.config.supportContactName);
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState<AssistantCommandResponse>(starterResponse);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supportNotice, setSupportNotice] = useState<string | null>(null);
  const [supportLogs, setSupportLogs] = useState<SupportLogEntry[]>([]);

  const goTo = useUiStore((state) => state.goTo);
  const goHome = useUiStore((state) => state.goHome);
  const quickActions = useMemo(() => {
    const supportLabel = supportContactName.trim();
    const actions = [...baseQuickActions];

    if (supportLabel.length > 0) {
      actions.push(`Call ${supportLabel}`);
    }

    return actions;
  }, [supportContactName]);

  const loadSupportLogs = async () => {
    try {
      const result = await fetchSupportLogs(5);
      setSupportLogs(result.logs);
    } catch {
      setSupportLogs([]);
    }
  };

  useEffect(() => {
    void loadSupportLogs();
  }, []);

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

  const escalateSupport = async (reason: string, riskLevel: AssistantCommandResponse['riskLevel']) => {
    try {
      const result = await requestSupport({
        userId: 'local-user-1',
        sessionId: 'phase2-session',
        reason,
        screen: 'help',
        riskLevel
      });

      setSupportNotice(`${result.message} Ticket: ${result.ticketId}. ETA: ${result.estimatedCallbackMinutes} minutes.`);
      await loadSupportLogs();
    } catch {
      setSupportNotice('Could not create support request right now. Please try again.');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void requestCommand(command);
  };

  const startVoiceInput = () => {
    const speechApi = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: ((event: { error?: string }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: ((event: { error?: string }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
    };

    const Recognition = speechApi.SpeechRecognition ?? speechApi.webkitSpeechRecognition;

    if (!Recognition) {
      setErrorMessage('Voice input is not available in this environment.');
      return;
    }

    setErrorMessage(null);
    setIsListening(true);

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript?.trim() ?? '';

      if (!spoken) {
        return;
      }

      setCommand(spoken);
      void requestCommand(spoken);
    };
    recognition.onerror = (event) => {
      setErrorMessage(`Voice input failed${event.error ? `: ${event.error}` : '.'}`);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const handleAction = (action: AssistantAction) => {
    if (action.id === 'open_email') {
      goTo('email');
      return;
    }

    if (action.id === 'open_internet') {
      goTo('internet');
      return;
    }

    if (action.id === 'open_facebook') {
      goTo('facebook');
      return;
    }

    if (action.id === 'open_videocall') {
      goTo('videocall');
      return;
    }

    if (action.id === 'open_family') {
      goTo('family');
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

    if (
      action.id === 'call_support' ||
      action.id === 'contact_support' ||
      action.id === 'blocked_contact_support' ||
      action.id === 'share_screen'
    ) {
      if (action.requiresConfirmation) {
        const approved = window.confirm('This action needs approval. Continue?');

        if (!approved) {
          return;
        }
      }

      void escalateSupport(action.label, response.riskLevel);
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
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isLoading || isListening}
              className="rounded-2xl border-2 border-[#315740] bg-white px-6 py-4 text-xl font-semibold text-[#1f3b2c] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isListening ? 'Listening...' : 'Use Voice'}
            </button>
          </div>
        </form>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-[#d7be7f] bg-[#fff2ce] p-4 text-lg text-[#5c3b00] sm:text-xl">
          {errorMessage}
        </div>
      ) : null}

      {supportNotice ? (
        <div className="mb-6 rounded-2xl border border-[#9ac6a4] bg-[#dff2e5] p-4 text-lg text-[#174128] sm:text-xl">
          {supportNotice}
        </div>
      ) : null}

      <div className="mb-6">
        <AssistantResponseCard response={response} loading={isLoading} onAction={handleAction} />
      </div>

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
            Recent Support Requests
          </h2>
          <button
            type="button"
            onClick={() => {
              void loadSupportLogs();
            }}
            className="rounded-xl border-2 border-[var(--line-strong)] bg-white px-4 py-2 text-lg font-semibold text-[var(--text-strong)]"
          >
            Refresh
          </button>
        </div>

        {supportLogs.length === 0 ? (
          <p className="text-xl text-[var(--text-muted)] sm:text-2xl">No support requests yet.</p>
        ) : (
          <div className="space-y-3">
            {supportLogs.map((log) => (
              <article key={log.id} className="rounded-2xl border border-[var(--line-soft)] bg-white p-4">
                <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">{log.reason}</p>
                <p className="mt-1 text-lg text-[var(--text-muted)] sm:text-xl">
                  {new Date(log.createdAt).toLocaleString()} • Status: {log.status}
                </p>
              </article>
            ))}
          </div>
        )}
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
