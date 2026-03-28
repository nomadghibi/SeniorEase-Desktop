import { create } from 'zustand';

type AdminState = {
  isSettingsUnlocked: boolean;
  unlockSettings: () => void;
  lockSettings: () => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  isSettingsUnlocked: false,
  unlockSettings: () => set({ isSettingsUnlocked: true }),
  lockSettings: () => set({ isSettingsUnlocked: false })
}));
