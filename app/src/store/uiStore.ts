import { create } from 'zustand';
import type { ScreenId } from '@/lib/modules';

type UiState = {
  currentScreen: ScreenId;
  history: ScreenId[];
  reminderCount: number;
  assistantNote: string | null;
  goTo: (screen: ScreenId) => void;
  goHome: () => void;
  goBack: () => void;
  openHelp: () => void;
  useSpeak: () => Promise<void>;
  clearAssistantNote: () => void;
};

const defaultSpeakHint = 'Voice support is coming soon. Tap Help for guided assistance.';

export const useUiStore = create<UiState>((set, get) => ({
  currentScreen: 'home',
  history: [],
  reminderCount: 2,
  assistantNote: null,
  goTo: (screen) => {
    const { currentScreen, history } = get();

    if (screen === currentScreen) {
      return;
    }

    set({
      currentScreen: screen,
      history: [...history, currentScreen].slice(-30),
      assistantNote: null
    });
  },
  goHome: () => {
    const { currentScreen, history } = get();

    if (currentScreen === 'home') {
      return;
    }

    set({
      currentScreen: 'home',
      history: [...history, currentScreen].slice(-30)
    });
  },
  goBack: () => {
    const { history } = get();

    if (history.length === 0) {
      return;
    }

    const nextHistory = history.slice(0, -1);
    const previousScreen = history[history.length - 1];

    set({
      currentScreen: previousScreen,
      history: nextHistory,
      assistantNote: null
    });
  },
  openHelp: () => {
    const { currentScreen, history } = get();

    if (currentScreen === 'help') {
      return;
    }

    set({
      currentScreen: 'help',
      history: [...history, currentScreen].slice(-30)
    });
  },
  useSpeak: async () => {
    let message = defaultSpeakHint;

    if (window.seniorEase?.getSpeakHint) {
      try {
        message = await window.seniorEase.getSpeakHint();
      } catch {
        message = defaultSpeakHint;
      }
    }

    set({ assistantNote: message });
  },
  clearAssistantNote: () => set({ assistantNote: null })
}));
