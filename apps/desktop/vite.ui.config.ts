import { mergeConfig } from 'vite';
import uiConfig from '../../packages/ui/vite.config.ts';

export default mergeConfig(uiConfig, {
  root: '../../packages/ui',
  build: {
    // Keep UI output beside the desktop app's other Vite bundles.
    outDir: '../../apps/desktop/.vite/ui/main_window',
  },
});
