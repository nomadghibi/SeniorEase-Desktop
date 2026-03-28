import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';
import type { ScreenId } from '@/lib/modules';
import { useState } from 'react';

const FamilyScreen = () => {
  const contacts = useConfigStore((state) => state.config.familyContacts);
  const allowedModules = useConfigStore((state) => state.config.allowedModules);
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
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => openModuleForContact('email', contact.name)}
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-3 text-left text-xl font-semibold text-[var(--text-strong)]"
              >
                Send Email
              </button>
              <button
                type="button"
                onClick={() => openModuleForContact('videocall', contact.name)}
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
