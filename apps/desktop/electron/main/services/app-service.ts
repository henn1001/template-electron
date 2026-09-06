import { app } from 'electron';
import type { AppInfo } from '@template/shared/ipc/responses';

export function getAppInfo(): AppInfo {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    electronVersion: process.versions.electron,
  };
}
