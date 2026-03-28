/// <reference types="vite/client" />

declare global {
  interface Window {
    seniorEase?: {
      getSpeakHint: () => Promise<string>;
      electronVersion: string;
    };
  }
}

export {};
