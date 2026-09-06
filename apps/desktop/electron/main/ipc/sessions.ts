import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '@template/shared/ipc/channels';
import type { SessionRequest } from '@template/shared/ipc/requests';
import { sessionManager } from '../services/session-manager';

export function registerSessionHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.sessions.list, () => sessionManager.list());
  ipcMain.handle(IPC_CHANNELS.sessions.start, (_event, id: SessionRequest) => sessionManager.start(id));
  ipcMain.handle(IPC_CHANNELS.sessions.stop, (_event, id: SessionRequest) => sessionManager.stop(id));
}
