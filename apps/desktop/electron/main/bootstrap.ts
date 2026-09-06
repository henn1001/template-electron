import { app } from 'electron';
import started from 'electron-squirrel-startup';
import { setupApplicationLifecycle } from './app';
import { registerIpc } from './ipc';
import { createMainWindow } from './windows/main-window';

async function bootstrap(): Promise<void> {
  await app.whenReady();
  registerIpc();
  createMainWindow();
  setupApplicationLifecycle(createMainWindow);
}

if (started) {
  app.quit();
} else {
  void bootstrap().catch((error: unknown) => {
    console.error('Unable to start the application.', error);
    app.quit();
  });
}
