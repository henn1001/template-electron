import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '@template/shared/ipc/channels';
import { getAppInfo } from '../services/app-service';

export function registerAppHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.app.getInfo, () => getAppInfo());
}
