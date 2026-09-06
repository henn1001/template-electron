export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  theme: ThemePreference;
  launchAtLogin: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'system',
  launchAtLogin: false,
};
