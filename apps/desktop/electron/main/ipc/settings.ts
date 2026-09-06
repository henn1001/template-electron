import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '@template/shared/ipc/channels';
import type { SaveSettingsRequest } from '@template/shared/ipc/requests';
import { loadSettings, saveSettings } from '../services/settings-service';

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.settings.load, () => loadSettings());
  ipcMain.handle(IPC_CHANNELS.settings.save, (_event, settings: SaveSettingsRequest) => saveSettings(settings));
}
