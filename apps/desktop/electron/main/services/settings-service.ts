import { SettingsStore } from '../persistence/settings-store';
import { isAppSettings } from '@template/shared/validation/settings';
import type { AppSettings } from '@template/shared/models/config';

const settingsStore = new SettingsStore();

export function loadSettings(): Promise<AppSettings> {
  return settingsStore.load();
}

export function saveSettings(value: unknown): Promise<AppSettings> {
  if (!isAppSettings(value)) {
    throw new TypeError('Invalid settings payload.');
  }

  return settingsStore.save(value);
}
