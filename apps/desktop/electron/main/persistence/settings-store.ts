import { app } from 'electron';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_APP_SETTINGS, type AppSettings } from '@template/shared/models/config';
import { isAppSettings } from '@template/shared/validation/settings';

export class SettingsStore {
  private get filePath(): string {
    return path.join(app.getPath('userData'), 'settings.json');
  }

  async load(): Promise<AppSettings> {
    try {
      const contents = await readFile(this.filePath, 'utf8');
      const parsed: unknown = JSON.parse(contents);

      return isAppSettings(parsed) ? parsed : { ...DEFAULT_APP_SETTINGS };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('Unable to read settings; using defaults.', error);
      }

      return { ...DEFAULT_APP_SETTINGS };
    }
  }

  async save(settings: AppSettings): Promise<AppSettings> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(settings, null, 2), 'utf8');
    return settings;
  }
}
