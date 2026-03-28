import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';
import type { ScreenId } from '@/lib/modules';
import { useState } from 'react';

const toDialablePhone = (value: string): string => {
  return value.replace(/[^\d+]/g, '');
};

const FamilyScreen = () => {
  const contacts = useConfigStore((state) => state.config.familyContacts);
  const allowedModules = useConfigStore((state) => state.config.allowedModules);
  const supportContactName = useConfigStore((state) => state.config.supportContactName);
  const goTo = useUiStore((state) => state.goTo);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const openModuleForContact = (screen: Extract<ScreenId, 'email' | 'photos' | 'videocall'>, contactName: string) => {
    if (!allowedModules[screen]) {
      setActionMessage(`${screen === 'videocall' ? 'Video Call' : screen} is currently turned off in Settings.`);
      return;
    }

    goTo(screen);

    if (screen === 'email') {
      setActionMessage(`Opening Email to write to ${contactName}.`);
      return;
    }

    if (screen === 'videocall') {
      setActionMessage(`Opening Video Call to contact ${contactName}.`);
      return;
    }

    setActionMessage(`Opening Photos so you can share with ${contactName}.`);
  };

  const emailContact = (contact: (typeof contacts)[number]) => {
    if (contact.email?.trim()) {
      const approved = window.confirm(`Open an email draft to ${contact.name}?`);

      if (!approved) {
        setActionMessage('Canceled email draft.');
        return;
      }

      const subject = encodeURIComponent(`Hello ${contact.name}`);
      window.open(`mailto:${contact.email}?subject=${subject}`, '_self');
      setActionMessage(`Prepared an email draft for ${contact.name}.`);
      return;
    }

    openModuleForContact('email', contact.name);
  };

  const callContact = (contact: (typeof contacts)[number]) => {
    if (contact.phone?.trim()) {
      const approved = window.confirm(`Call ${contact.name} at ${contact.phone}?`);

      if (!approved) {
        setActionMessage('Canceled call.');
        return;
      }

      const dialable = toDialablePhone(contact.phone);

      if (!dialable) {
        setActionMessage(`Could not use this phone number for ${contact.name}.`);
        return;
      }

      window.open(`tel:${dialable}`, '_self');
      setActionMessage(`Calling ${contact.name}.`);
      return;
    }

    openModuleForContact('videocall', contact.name);
  };

  const messageContact = (contact: (typeof contacts)[number]) => {
    if (contact.phone?.trim()) {
      const approved = window.confirm(`Open a text message to ${contact.name}?`);

      if (!approved) {
        setActionMessage('Canceled message.');
        return;
      }

      const dialable = toDialablePhone(contact.phone);

      if (!dialable) {
        setActionMessage(`Could not use this phone number for ${contact.name}.`);
        return;
      }

      window.open(`sms:${dialable}`, '_self');
      setActionMessage(`Prepared a text message to ${contact.name}.`);
      return;
    }

    if (contact.email?.trim()) {
      const approved = window.confirm(
        `${contact.name} has no mobile number saved. Send an email message instead?`
      );

      if (!approved) {
        setActionMessage('Canceled message.');
        return;
      }

      const subject = encodeURIComponent(`Quick message for ${contact.name}`);
      window.open(`mailto:${contact.email}?subject=${subject}`, '_self');
      setActionMessage(`Prepared an email message for ${contact.name}.`);
      return;
    }

    setActionMessage(
      `No phone or email saved for ${contact.name}. Update contact info in Settings or call ${supportContactName}.`
    );
  };

  return (
    <section>
      <ScreenHeader
        title="Family"
        subtitle="Choose a contact and pick what you want to do."
      />

      {actionMessage ? (
        <div className="mb-5 rounded-2xl border border-[#9ac6a4] bg-[#dff2e5] p-4 text-lg text-[#174128] sm:text-xl">
          {actionMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contacts.length === 0 ? (
          <article className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-5 md:col-span-2 xl:col-span-3">
            <p className="text-2xl text-[var(--text-muted)] sm:text-3xl">
              No family contacts configured yet.
            </p>
          </article>
        ) : null}
        {contacts.map((contact) => (
          <article
            key={contact.id}
            className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-5"
          >
            <p className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">{contact.name}</p>
            <p className="mt-2 text-lg text-[var(--text-muted)] sm:text-xl">{contact.relation}</p>
            {contact.phone ? (
              <p className="mt-1 text-base text-[var(--text-muted)] sm:text-lg">Phone: {contact.phone}</p>
            ) : null}
            {contact.email ? (
              <p className="text-base text-[var(--text-muted)] sm:text-lg">Email: {contact.email}</p>
            ) : null}
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => emailContact(contact)}
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-3 text-left text-xl font-semibold text-[var(--text-strong)]"
              >
                Send Email
              </button>
              <button
                type="button"
                onClick={() => messageContact(contact)}
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-3 text-left text-xl font-semibold text-[var(--text-strong)]"
              >
                Send Message
              </button>
              <button
                type="button"
                onClick={() => callContact(contact)}
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-3 text-left text-xl font-semibold text-[var(--text-strong)]"
              >
                Start Call
              </button>
              <button
                type="button"
                onClick={() => openModuleForContact('photos', contact.name)}
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-3 text-left text-xl font-semibold text-[var(--text-strong)]"
              >
                Share Photo
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FamilyScreen;
