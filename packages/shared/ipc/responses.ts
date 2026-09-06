import type { AppSettings } from '../models/config';
import type { Session } from '../models/session';

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  electronVersion: string;
}

export type LoadSettingsResponse = AppSettings;
export type ListSessionsResponse = Session[];
