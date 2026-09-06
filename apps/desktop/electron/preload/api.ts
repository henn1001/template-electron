import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@template/shared/ipc/channels';
import type { ElectronApi } from './types';

const api: ElectronApi = {
  app: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.app.getInfo),
  },
  settings: {
    load: () => ipcRenderer.invoke(IPC_CHANNELS.settings.load),
    save: (settings) => ipcRenderer.invoke(IPC_CHANNELS.settings.save, settings),
  },
  sessions: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.sessions.list),
    start: (id) => ipcRenderer.invoke(IPC_CHANNELS.sessions.start, id),
    stop: (id) => ipcRenderer.invoke(IPC_CHANNELS.sessions.stop, id),
  },
};

contextBridge.exposeInMainWorld('api', api);
