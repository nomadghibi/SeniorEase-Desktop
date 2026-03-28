import { useEffect, useMemo, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';

type EmailStatus = 'inbox' | 'archived' | 'deleted';

type EmailItem = {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  status: EmailStatus;
};

const initialEmails: EmailItem[] = [
  {
    id: 'email-1',
    from: 'Anna <anna@example.com>',
    subject: 'Sunday lunch at my house',
    body: 'Hi Mom, we are planning Sunday lunch at 1:00 PM. Michael will pick you up at 12:30. Love you.',
    receivedAt: 'Today 8:45 AM',
    unread: true,
    status: 'inbox'
  },
  {
    id: 'email-2',
    from: 'City Pharmacy <noreply@citypharmacy.com>',
    subject: 'Your refill is ready for pickup',
    body: 'Your refill is ready. Pickup window is until 6:00 PM. Reply if you need delivery support.',
    receivedAt: 'Today 7:10 AM',
    unread: false,
    status: 'inbox'
  },
  {
    id: 'email-3',
    from: 'Unknown Sender <urgent-security@mail-safe-alert.net>',
    subject: 'Urgent: verify your account now',
    body: 'Your account is suspended. Click this link and enter your password now to avoid permanent lockout.',
    receivedAt: 'Yesterday 5:30 PM',
    unread: true,
    status: 'inbox'
  }
];

const suspiciousPatterns = [
  'urgent',
  'verify your account',
  'password',
  'wire transfer',
  'gift card',
  'click this link',
  'suspended'
];

const isSuspiciousEmail = (email: EmailItem): boolean => {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  return suspiciousPatterns.some((pattern) => text.includes(pattern));
};

const summarizeEmail = (email: EmailItem): string => {
  const sentences = email.body.split('.').map((line) => line.trim()).filter(Boolean);

  if (sentences.length === 0) {
    return 'This message is short and clear.';
  }

  return sentences.slice(0, 2).join('. ') + '.';
};

const createDraftReply = (email: EmailItem): string => {
  const senderName = email.from.split('<')[0]?.trim() || 'there';

  if (isSuspiciousEmail(email)) {
    return `Hi ${senderName},\n\nI received this message but I need to verify it with support before I continue.\n\nThank you.`;
  }

  return `Hi ${senderName},\n\nThank you for the update. I got your message and will follow up soon.\n\nLove,\nMe`;
};

const EmailScreen = () => {
  const [emails, setEmails] = useState<EmailItem[]>(initialEmails);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState('');
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const inboxEmails = useMemo(() => emails.filter((email) => email.status === 'inbox'), [emails]);
  const archivedCount = useMemo(
    () => emails.filter((email) => email.status === 'archived').length,
    [emails]
  );

  useEffect(() => {
    if (!selectedEmailId && inboxEmails.length > 0) {
      setSelectedEmailId(inboxEmails[0].id);
      return;
    }

    if (selectedEmailId && !inboxEmails.some((email) => email.id === selectedEmailId)) {
      setSelectedEmailId(inboxEmails[0]?.id ?? null);
      setDraftReply('');
      setSummaryText(null);
    }
  }, [inboxEmails, selectedEmailId]);

  const selectedEmail = useMemo(
    () => inboxEmails.find((email) => email.id === selectedEmailId) ?? null,
    [inboxEmails, selectedEmailId]
  );

  const markAsRead = (id: string) => {
    setEmails((current) =>
      current.map((email) => (email.id === id ? { ...email, unread: false } : email))
    );
  };

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setSummaryText(null);
    setDraftReply('');
    markAsRead(id);
  };

  const updateEmailStatus = (id: string, status: EmailStatus) => {
    setEmails((current) =>
      current.map((email) => (email.id === id ? { ...email, status, unread: false } : email))
    );
  };

  const handleReadAloud = () => {
    if (!selectedEmail) {
      return;
    }

    markAsRead(selectedEmail.id);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `From ${selectedEmail.from}. Subject ${selectedEmail.subject}. ${selectedEmail.body}`
      );
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      setStatusMessage('Reading email out loud.');
      return;
    }

    setStatusMessage('Read aloud is not available on this device.');
  };

  const handleSummarize = () => {
    if (!selectedEmail) {
      return;
    }

    markAsRead(selectedEmail.id);
    setSummaryText(summarizeEmail(selectedEmail));
    setStatusMessage('Summary is ready below.');
  };

  const handleDraftReply = () => {
    if (!selectedEmail) {
      return;
    }

    const draft = createDraftReply(selectedEmail);
    setDraftReply(draft);
    setStatusMessage('Reply draft created. Please review before sending.');
  };

  const handleSendReply = () => {
    if (!selectedEmail || !draftReply.trim()) {
      return;
    }

    const approved = window.confirm('Send this reply now?');

    if (!approved) {
      return;
    }

    setStatusMessage(`Reply sent to ${selectedEmail.from}.`);
    setDraftReply('');
  };

  const handleArchive = () => {
    if (!selectedEmail) {
      return;
    }

    const approved = window.confirm('Archive this email?');

    if (!approved) {
      return;
    }

    updateEmailStatus(selectedEmail.id, 'archived');
    setStatusMessage('Email archived.');
    setSummaryText(null);
    setDraftReply('');
  };

  const handleDelete = () => {
    if (!selectedEmail) {
      return;
    }

    const approved = window.confirm('Delete this email?');

    if (!approved) {
      return;
    }

    updateEmailStatus(selectedEmail.id, 'deleted');
    setStatusMessage('Email deleted.');
    setSummaryText(null);
    setDraftReply('');
  };

  return (
    <section>
      <ScreenHeader
        title="Email"
        subtitle="Read, reply, and stay safe with clear steps."
      />

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-[#9ac6a4] bg-[#dff2e5] p-4 text-lg text-[#174128] sm:text-xl">
          {statusMessage}
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl border border-[#d7be7f] bg-[#fff2ce] p-4 text-lg text-[#614000] sm:text-xl">
        <strong className="font-semibold">Safety Tip:</strong> Never share passwords or payment details by email.
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <aside className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)]">Inbox</h2>
            <p className="text-lg text-[var(--text-muted)]">
              {inboxEmails.length} messages • {archivedCount} archived
            </p>
          </div>

          <div className="space-y-3">
            {inboxEmails.length === 0 ? (
              <p className="rounded-2xl border border-[var(--line-soft)] bg-white p-4 text-xl text-[var(--text-muted)]">
                No inbox messages right now.
              </p>
            ) : null}

            {inboxEmails.map((email) => {
              const suspicious = isSuspiciousEmail(email);
              const selected = email.id === selectedEmail?.id;

              return (
                <button
                  key={email.id}
                  type="button"
                  onClick={() => handleSelectEmail(email.id)}
                  className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition-colors ${
                    selected
                      ? 'border-[#2d5d42] bg-[#eef8f0]'
                      : 'border-[var(--line-soft)] bg-white hover:border-[var(--line-strong)]'
                  }`}
                >
                  <p className="text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">{email.subject}</p>
                  <p className="mt-1 text-lg text-[var(--text-muted)]">{email.from}</p>
                  <p className="mt-1 text-base text-[var(--text-muted)]">{email.receivedAt}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {email.unread ? (
                      <span className="rounded-full border border-[#2d5d42] bg-[#dff2e5] px-2 py-0.5 text-sm font-semibold text-[#174128]">
                        Unread
                      </span>
                    ) : null}
                    {suspicious ? (
                      <span className="rounded-full border border-[#de9d9d] bg-[#fde4e4] px-2 py-0.5 text-sm font-semibold text-[#6a1f1f]">
                        Suspicious
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          {!selectedEmail ? (
            <p className="text-2xl text-[var(--text-muted)] sm:text-3xl">Select an email to read it.</p>
          ) : (
            <>
              <div className="mb-4 border-b border-[var(--line-soft)] pb-4">
                <p className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
                  {selectedEmail.subject}
                </p>
                <p className="mt-2 text-xl text-[var(--text-muted)] sm:text-2xl">From: {selectedEmail.from}</p>
                <p className="text-lg text-[var(--text-muted)]">{selectedEmail.receivedAt}</p>
              </div>

              {isSuspiciousEmail(selectedEmail) ? (
                <div className="mb-5 rounded-2xl border border-[#de9d9d] bg-[#fde4e4] p-4 text-lg text-[#6a1f1f] sm:text-xl">
                  <strong className="font-semibold">Warning:</strong> This email may be suspicious. Do not click links until support reviews it.
                </div>
              ) : null}

              <p className="whitespace-pre-wrap text-xl leading-relaxed text-[var(--text-strong)] sm:text-2xl">
                {selectedEmail.body}
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className="rounded-xl border-2 border-[var(--line-strong)] bg-white px-4 py-3 text-xl font-semibold text-[var(--text-strong)]"
                >
                  Read Aloud
                </button>
                <button
                  type="button"
                  onClick={handleSummarize}
                  className="rounded-xl border-2 border-[var(--line-strong)] bg-white px-4 py-3 text-xl font-semibold text-[var(--text-strong)]"
                >
                  Summarize
                </button>
                <button
                  type="button"
                  onClick={handleDraftReply}
                  className="rounded-xl border-2 border-[var(--line-strong)] bg-white px-4 py-3 text-xl font-semibold text-[var(--text-strong)]"
                >
                  Draft Reply
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-3 text-xl font-semibold text-white"
                >
                  Archive
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-xl border-2 border-[#a44343] bg-[#a44343] px-4 py-3 text-xl font-semibold text-white"
                >
                  Delete
                </button>
              </div>

              {summaryText ? (
                <div className="mt-5 rounded-2xl border border-[#aacfb1] bg-[#dff2e5] p-4 text-xl text-[#174128] sm:text-2xl">
                  <strong className="font-semibold">Simple Summary:</strong> {summaryText}
                </div>
              ) : null}

              {draftReply ? (
                <div className="mt-5 space-y-3 rounded-2xl border border-[var(--line-soft)] bg-white p-4">
                  <label className="block text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">
                    Reply Draft
                  </label>
                  <textarea
                    value={draftReply}
                    onChange={(event) => setDraftReply(event.target.value)}
                    className="h-40 w-full rounded-xl border-2 border-[var(--line-soft)] px-4 py-3 text-lg text-[var(--text-strong)] sm:text-xl"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-5 py-3 text-xl font-semibold text-white"
                  >
                    Send Reply
                  </button>
                </div>
              ) : null}
            </>
          )}
        </article>
      </div>
    </section>
  );
};

export default EmailScreen;
