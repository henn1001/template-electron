import { BrowserWindow } from 'electron';
import path from 'node:path';

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1240,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b1020',
    title: 'Electron Vue Template',
    webPreferences: {
      preload: path.join(__dirname, 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Keep the native window frame and controls, but remove the File/Edit/View/Window menu bar.
  mainWindow.setMenuBarVisibility(false);
  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, `../ui/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  return mainWindow;
}
