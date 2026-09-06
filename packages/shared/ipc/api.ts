import type { AppSettings } from '../models/config';
import type { Session } from '../models/session';
import type { AppInfo } from './responses';

export interface ElectronApi {
  app: {
    getInfo: () => Promise<AppInfo>;
  };
  settings: {
    load: () => Promise<AppSettings>;
    save: (settings: AppSettings) => Promise<AppSettings>;
  };
  sessions: {
    list: () => Promise<Session[]>;
    start: (id: string) => Promise<Session>;
    stop: (id: string) => Promise<Session>;
  };
}
