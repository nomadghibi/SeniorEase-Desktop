import { useMemo, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';

type MeetingShortcut = {
  id: string;
  label: string;
  provider: 'Zoom' | 'Google Meet' | 'Microsoft Teams';
  link: string;
};

const meetingShortcuts: MeetingShortcut[] = [
  {
    id: 'meet-1',
    label: 'Family Sunday Call',
    provider: 'Zoom',
    link: 'https://zoom.us/j/1111111111'
  },
  {
    id: 'meet-2',
    label: 'Doctor Follow-up',
    provider: 'Google Meet',
    link: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 'meet-3',
    label: 'Support Session',
    provider: 'Microsoft Teams',
    link: 'https://teams.microsoft.com/l/meetup-join/1234567890'
  }
];

const appLaunchers = [
  {
    id: 'zoom-app',
    label: 'Open Zoom',
    action: () => window.open('https://zoom.us/', '_blank', 'noopener,noreferrer')
  },
  {
    id: 'meet-app',
    label: 'Open Google Meet',
    action: () => window.open('https://meet.google.com/', '_blank', 'noopener,noreferrer')
  },
  {
    id: 'teams-app',
    label: 'Open Microsoft Teams',
    action: () => window.open('https://teams.microsoft.com/', '_blank', 'noopener,noreferrer')
  }
];

const VideoCallScreen = () => {
  const contacts = useConfigStore((state) => state.config.familyContacts);
  const supportContactName = useConfigStore((state) => state.config.supportContactName);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const prioritizedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => (a.relation > b.relation ? 1 : -1));
  }, [contacts]);

  const startContactCall = (contactId: string) => {
    const contact = contacts.find((entry) => entry.id === contactId);

    if (!contact) {
      return;
    }

    const approved = window.confirm(`Start a call with ${contact.name}?`);

    if (!approved) {
      return;
    }

    if (contact.phone) {
      window.open(`tel:${contact.phone.replace(/[^\d+]/g, '')}`, '_self');
      setStatusMessage(`Calling ${contact.name} at ${contact.phone}.`);
      return;
    }

    if (contact.email) {
      window.open(`mailto:${contact.email}?subject=Video%20Call%20Request`, '_self');
      setStatusMessage(`Prepared a call request email to ${contact.name}.`);
      return;
    }

    setStatusMessage(`Opening your video call app for ${contact.name}.`);
    window.open('https://zoom.us/', '_blank', 'noopener,noreferrer');
  };

  const openMeetingShortcut = (shortcut: MeetingShortcut) => {
    const approved = window.confirm(`Open meeting: ${shortcut.label}?`);

    if (!approved) {
      return;
    }

    window.open(shortcut.link, '_blank', 'noopener,noreferrer');
    setStatusMessage(`${shortcut.label} opened in ${shortcut.provider}.`);
  };

  const launchProvider = (launcherId: string) => {
    const launcher = appLaunchers.find((entry) => entry.id === launcherId);

    if (!launcher) {
      return;
    }

    launcher.action();
    setStatusMessage(`${launcher.label} opened.`);
  };

  return (
    <section>
      <ScreenHeader
        title="Video Call"
        subtitle="Start a call with family or open your saved meeting links quickly."
      />

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-[#9ac6a4] bg-[#dff2e5] p-4 text-lg text-[#174128] sm:text-xl">
          {statusMessage}
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl border border-[#d7be7f] bg-[#fff2ce] p-4 text-lg text-[#614000] sm:text-xl">
        <strong className="font-semibold">Safety Tip:</strong> Only join meetings you expect. If a link looks unfamiliar, contact {supportContactName} first.
      </div>

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Family Call Shortcuts
        </h2>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {prioritizedContacts.length === 0 ? (
            <p className="rounded-2xl border border-[var(--line-soft)] bg-white p-4 text-xl text-[var(--text-muted)] md:col-span-2 xl:col-span-3">
              No contacts available yet.
            </p>
          ) : null}

          {prioritizedContacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => startContactCall(contact.id)}
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left transition-colors hover:border-[var(--line-strong)]"
            >
              <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
                Call {contact.name}
              </p>
              <p className="mt-1 text-lg text-[var(--text-muted)] sm:text-xl">{contact.relation}</p>
              <p className="mt-1 text-base text-[var(--text-muted)]">
                {contact.phone ? `Phone: ${contact.phone}` : contact.email ? `Email: ${contact.email}` : 'Use default video app'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Saved Meeting Links
        </h2>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {meetingShortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              type="button"
              onClick={() => openMeetingShortcut(shortcut)}
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left transition-colors hover:border-[var(--line-strong)]"
            >
              <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">{shortcut.label}</p>
              <p className="mt-1 text-lg text-[var(--text-muted)] sm:text-xl">{shortcut.provider}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Open Video App
        </h2>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {appLaunchers.map((launcher) => (
            <button
              key={launcher.id}
              type="button"
              onClick={() => launchProvider(launcher.id)}
              className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-5 py-4 text-left text-2xl font-semibold text-[var(--text-strong)] transition-colors hover:border-[var(--line-strong)] sm:text-3xl"
            >
              {launcher.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoCallScreen;
