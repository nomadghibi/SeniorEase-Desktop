import { ArrowLeft, HandHelping, Home, Mic } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

const buttonClasses =
  'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-transparent px-3 py-3 text-lg font-semibold text-[var(--text-inverse)] transition-colors sm:text-xl';

const BottomNav = () => {
  const currentScreen = useUiStore((state) => state.currentScreen);
  const historyLength = useUiStore((state) => state.history.length);
  const goHome = useUiStore((state) => state.goHome);
  const goBack = useUiStore((state) => state.goBack);
  const openHelp = useUiStore((state) => state.openHelp);
  const useSpeak = useUiStore((state) => state.useSpeak);

  return (
    <nav className="sticky bottom-0 z-20 border-t border-[#315740] bg-[var(--bg-nav)] px-3 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl gap-2 sm:gap-3">
        <button
          type="button"
          onClick={goHome}
          className={`${buttonClasses} ${currentScreen === 'home' ? 'bg-[#355a45]' : 'bg-transparent hover:bg-[#355a45]'}`}
        >
          <Home aria-hidden="true" />
          Home
        </button>

        <button
          type="button"
          onClick={goBack}
          className={`${buttonClasses} ${historyLength === 0 ? 'cursor-not-allowed opacity-45' : 'hover:bg-[#355a45]'}`}
          disabled={historyLength === 0}
        >
          <ArrowLeft aria-hidden="true" />
          Back
        </button>

        <button
          type="button"
          onClick={() => {
            void useSpeak();
          }}
          className={`${buttonClasses} hover:bg-[#355a45]`}
        >
          <Mic aria-hidden="true" />
          Speak
        </button>

        <button
          type="button"
          onClick={openHelp}
          className={`${buttonClasses} ${currentScreen === 'help' ? 'bg-[#8a5b18]' : 'bg-[#6e4a16] hover:bg-[#8a5b18]'}`}
        >
          <HandHelping aria-hidden="true" />
          Help
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
