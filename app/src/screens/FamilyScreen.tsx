import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';

const FamilyScreen = () => {
  const contacts = useConfigStore((state) => state.config.familyContacts);

  return (
    <section>
      <ScreenHeader
        title="Family"
        subtitle="Choose a contact and pick what you want to do."
      />

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
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-3 text-left text-xl font-semibold text-[var(--text-strong)]"
              >
                Send Email
              </button>
              <button
                type="button"
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-3 text-left text-xl font-semibold text-[var(--text-strong)]"
              >
                Start Call
              </button>
              <button
                type="button"
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
