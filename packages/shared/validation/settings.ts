import type { AppSettings, ThemePreference } from '../models/config';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];

export function isAppSettings(value: unknown): value is AppSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const settings = value as Record<string, unknown>;
  return (
    typeof settings.launchAtLogin === 'boolean' &&
    typeof settings.theme === 'string' &&
    THEMES.includes(settings.theme as ThemePreference)
  );
}
