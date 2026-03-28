import { create } from 'zustand';
import {
  fetchConfig,
  resetConfigToDefaults,
  saveConfig
} from '@/lib/configClient';
import type { AppConfig, AppConfigPatch } from '@/types/config';
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
  requireAdminPin: true,
  adminPin: '1234',
  allowedModules: {
    email: true,
    photos: true,
    internet: true,
    facebook: true,
    videocall: true,
    family: true,
    help: true,
    settings: true
  },
  updatedAt: new Date().toISOString()
};

type ConfigState = {
  config: AppConfig;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  loadConfig: () => Promise<void>;
  saveConfigPatch: (patch: AppConfigPatch) => Promise<boolean>;
  resetConfig: () => Promise<boolean>;
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultConfig,
  isLoading: false,
  isSaving: false,
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
  },
  saveConfigPatch: async (patch) => {
    set({ isSaving: true, errorMessage: null });

    try {
      const config = await saveConfig(patch);
      useUiStore.getState().setReminderCount(config.reminders.length);
      set({
        config,
        isSaving: false,
        errorMessage: null
      });
      return true;
    } catch {
      set({
        isSaving: false,
        errorMessage: 'Could not save settings. Please try again.'
      });
      return false;
    }
  },
  resetConfig: async () => {
    set({ isSaving: true, errorMessage: null });

    try {
      const config = await resetConfigToDefaults();
      useUiStore.getState().setReminderCount(config.reminders.length);
      set({
        config,
        isSaving: false,
        errorMessage: null
      });
      return true;
    } catch {
      set({
        isSaving: false,
        errorMessage: 'Could not reset settings right now.'
      });
      return false;
    }
  }
}));
