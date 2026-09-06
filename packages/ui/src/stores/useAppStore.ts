import { reactive } from 'vue';
import type { AppInfo } from '@template/shared/ipc/responses';
import { DEFAULT_APP_SETTINGS, type AppSettings } from '@template/shared/models/config';
import type { Session } from '@template/shared/models/session';
import { electronApi } from '../api/electron';

interface AppState {
  appInfo: AppInfo | null;
  settings: AppSettings;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
}

export const appState = reactive<AppState>({
  appInfo: null,
  settings: { ...DEFAULT_APP_SETTINGS },
  sessions: [],
  isLoading: true,
  error: null,
});

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export async function loadDashboard(): Promise<void> {
  appState.isLoading = true;
  appState.error = null;

  try {
    const [appInfo, settings, sessions] = await Promise.all([
      electronApi.app.getInfo(),
      electronApi.settings.load(),
      electronApi.sessions.list(),
    ]);
    appState.appInfo = appInfo;
    appState.settings = settings;
    appState.sessions = sessions;
  } catch (error: unknown) {
    appState.error = getErrorMessage(error);
  } finally {
    appState.isLoading = false;
  }
}

export async function updateLaunchAtLogin(enabled: boolean): Promise<void> {
  try {
    appState.settings = await electronApi.settings.save({
      ...appState.settings,
      launchAtLogin: enabled,
    });
    appState.error = null;
  } catch (error: unknown) {
    appState.error = getErrorMessage(error);
  }
}

export async function toggleSession(session: Session): Promise<void> {
  try {
    const updated =
      session.status === 'running'
        ? await electronApi.sessions.stop(session.id)
        : await electronApi.sessions.start(session.id);
    const index = appState.sessions.findIndex((item) => item.id === session.id);
    if (index !== -1) {
      appState.sessions[index] = updated;
    }
    appState.error = null;
  } catch (error: unknown) {
    appState.error = getErrorMessage(error);
  }
}
