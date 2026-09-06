import type { ElectronApi } from '@template/shared/ipc/api';
import { createBrowserApi } from './browser';

declare global {
  interface Window {
    api?: ElectronApi;
  }
}

// Electron supplies window.api through preload. The browser fallback keeps the UI
// useful during standalone development without weakening the Electron bridge.
export const electronApi: ElectronApi = window.api ?? createBrowserApi();
