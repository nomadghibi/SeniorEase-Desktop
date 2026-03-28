import { contextBridge, ipcRenderer } from 'electron';

export type SeniorEaseDesktopApi = {
  getSpeakHint: () => Promise<string>;
  electronVersion: string;
};

const desktopApi: SeniorEaseDesktopApi = {
  getSpeakHint: () => ipcRenderer.invoke('assistant:get-speak-hint'),
  electronVersion: process.versions.electron
};

contextBridge.exposeInMainWorld('seniorEase', desktopApi);
