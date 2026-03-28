import { create } from 'zustand';
import { fetchConfig } from '@/lib/configClient';
import type { AppConfig } from '@/types/config';
import { useUiStore } from '@/store/uiStore';

const defaultConfig: AppConfig = {
  reminders: [
    { id: 'fallback-reminder-1', text: 'Take medication reminder', dueAt: '09:00' },
    { id: 'fallback-reminder-2', text: 'Call family reminder', dueAt: '18:30' }
  ],
  internetFavorites: [
    'Church Website',
    'Local Weather',
    'News You Trust',
    'Family Photo Album'
  ],
  familyContacts: [
    { id: 'anna', name: 'Anna', relation: 'Daughter' },
    { id: 'michael', name: 'Michael', relation: 'Grandson' }
  ],
  supportContactName: 'Support',
  safetyMode: 'standard',
  updatedAt: new Date().toISOString()
};

type ConfigState = {
  config: AppConfig;
  isLoading: boolean;
  errorMessage: string | null;
  loadConfig: () => Promise<void>;
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultConfig,
  isLoading: false,
  errorMessage: null,
  loadConfig: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const config = await fetchConfig();
      useUiStore.getState().setReminderCount(config.reminders.length);
      set({
        config,
        isLoading: false,
        errorMessage: null
      });
    } catch {
      useUiStore.getState().setReminderCount(defaultConfig.reminders.length);
      set({
        isLoading: false,
        errorMessage: 'Could not load remote config. Using local defaults.'
      });
    }
  }
}));
