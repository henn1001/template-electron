import { DEFAULT_APP_SETTINGS, type AppSettings } from '@template/shared/models/config';
import type { ElectronApi } from '@template/shared/ipc/api';
import type { AppInfo } from '@template/shared/ipc/responses';
import type { Session } from '@template/shared/models/session';

const browserAppInfo: AppInfo = {
  name: 'Northstar',
  version: '1.0.0',
  platform: getBrowserPlatform(),
  electronVersion: 'browser preview',
};

const browserSessions: Session[] = [
  {
    id: 'browser-design-system',
    name: 'Design system',
    description: 'Component library and visual language',
    status: 'running',
    lastActivityAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'browser-desktop-client',
    name: 'Desktop client',
    description: 'Electron shell and preload bridge',
    status: 'idle',
    lastActivityAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: 'browser-shared-contracts',
    name: 'Shared contracts',
    description: 'Typed models and IPC boundaries',
    status: 'stopped',
    lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

function getBrowserPlatform(): string {
  const platform = navigator.platform.toLowerCase();

  if (platform.includes('mac')) {
    return 'darwin';
  }

  if (platform.includes('win')) {
    return 'win32';
  }

  return 'linux';
}

function copySession(session: Session): Session {
  return { ...session };
}

export function createBrowserApi(): ElectronApi {
  let settings: AppSettings = { ...DEFAULT_APP_SETTINGS };

  return {
    app: {
      getInfo: async () => ({ ...browserAppInfo }),
    },
    settings: {
      load: async () => ({ ...settings }),
      save: async (nextSettings) => {
        settings = { ...nextSettings };
        return { ...settings };
      },
    },
    sessions: {
      list: async () => browserSessions.map(copySession),
      start: async (id) => updateSession(id, 'running'),
      stop: async (id) => updateSession(id, 'stopped'),
    },
  };
}

function updateSession(id: string, status: Session['status']): Session {
  const session = browserSessions.find((item) => item.id === id);

  if (!session) {
    throw new Error(`Unknown session: ${id}`);
  }

  session.status = status;
  session.lastActivityAt = new Date().toISOString();
  return copySession(session);
}
