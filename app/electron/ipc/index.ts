import type { IpcMain } from 'electron';

export const registerIpcHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('assistant:get-speak-hint', () => {
    return 'Voice support is coming soon. Tap Help any time for guidance.';
  });
};
