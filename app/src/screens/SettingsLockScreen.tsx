import { FormEvent, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { verifyAdminPin } from '@/lib/adminClient';
import { useAdminStore } from '@/store/adminStore';

const SettingsLockScreen = () => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const unlockSettings = useAdminStore((state) => state.unlockSettings);

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = pin.trim();

    if (!/^\d{4,8}$/.test(candidate)) {
      setErrorMessage('Enter a 4 to 8 digit PIN.');
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = await verifyAdminPin(candidate);

      if (isValid) {
        unlockSettings();
        setPin('');
        setErrorMessage(null);
        return;
      }

      setErrorMessage('PIN is incorrect. Please try again.');
    } catch {
      setErrorMessage('Could not verify PIN right now. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section>
      <ScreenHeader
        title="Admin Settings Locked"
        subtitle="Enter your admin PIN to open settings."
      />

      <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <form onSubmit={handleUnlock} className="space-y-4">
          <label
            htmlFor="admin-pin"
            className="block text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl"
          >
            Enter Admin PIN
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/[^\d]/g, '').slice(0, 8))}
              placeholder="4 to 8 digits"
              className="w-full rounded-2xl border-2 border-[var(--line-soft)] px-5 py-4 text-xl tracking-[0.25em] text-[var(--text-strong)] sm:text-2xl"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="rounded-2xl border-2 border-[#2d5d42] bg-[#2d5d42] px-6 py-4 text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? 'Checking...' : 'Unlock'}
            </button>
          </div>
        </form>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-[#de9d9d] bg-[#fde4e4] p-4 text-lg text-[#6a1f1f] sm:text-xl">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SettingsLockScreen;
