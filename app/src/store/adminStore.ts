import { create } from 'zustand';

type AdminState = {
  isSettingsUnlocked: boolean;
  adminToken: string | null;
  unlockSettings: (token: string) => void;
  lockSettings: () => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  isSettingsUnlocked: false,
  adminToken: null,
  unlockSettings: (token) =>
    set({
      isSettingsUnlocked: true,
      adminToken: token
    }),
  lockSettings: () =>
    set({
      isSettingsUnlocked: false,
      adminToken: null
    })
}));
