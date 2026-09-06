export const IPC_CHANNELS = {
  app: {
    getInfo: 'app:get-info',
  },
  settings: {
    load: 'settings:load',
    save: 'settings:save',
  },
  sessions: {
    list: 'sessions:list',
    start: 'sessions:start',
    stop: 'sessions:stop',
  },
} as const;
