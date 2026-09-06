import { registerAppHandlers } from './app';
import { registerSettingsHandlers } from './settings';
import { registerSessionHandlers } from './sessions';

export function registerIpc(): void {
  registerAppHandlers();
  registerSettingsHandlers();
  registerSessionHandlers();
}
