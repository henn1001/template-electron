# Electron Vue Template

A production-minded Electron workspace built with **TypeScript**, **Vue 3**, and **Vite**. It provides a polished desktop dashboard, a typed IPC bridge, persistent settings, and boundaries that make it straightforward to add another client later.

> The UI uses “Northstar” as a replaceable example product. Rename it, remove the sample session service, and start building on the boundaries already in place.

## Highlights

- Monorepo-style layout with `apps/` for runnable applications and `packages/` for shared code
- Electron Forge + Vite for development and packaging, with electron-builder producing an AppImage distributable
- Vue 3 UI package with a responsive, dependency-light starter dashboard
- Strict TypeScript across the desktop app, shared packages, and UI
- Secure defaults: `contextIsolation`, sandboxed preload, and disabled Node integration
- Minimal, typed `window.api` bridge; `ipcRenderer` never reaches the UI package
- Feature-oriented IPC handlers with services and persistence behind them
- File-backed settings example in the Electron user-data directory
- Session manager example showing a complete UI → preload → IPC → service flow

## Quick start

Install dependencies from the workspace root:

```bash
npm install
npm start
```

The development command starts the desktop shell and the Vite-powered UI with hot reload.

Run the project checks before committing:

```bash
npm run check       # TypeScript/Vue type checking + ESLint
npm run typecheck   # Desktop and UI type checking
npm run lint        # Desktop, shared, and Vue UI linting
```

Run the Vue frontend independently in a browser:

```bash
npm run ui:dev      # Vite development server with a browser API adapter
npm run ui:build    # Standalone production build
npm run ui:preview  # Preview the production build
```

Build and package the desktop app locally:

```bash
npm run package     # Package for the current platform
npm run make        # Create the Linux AppImage (the only distributable output)
```

The root scripts delegate to the `@template/desktop` and `@template/ui` workspaces. You can also run a desktop command directly:

```bash
npm --workspace @template/desktop run start
```

## Project structure

```text
.
├── apps/
│   └── desktop/
│       ├── electron/
│       │   ├── main/
│       │   │   ├── bootstrap.ts       # Application entry point
│       │   │   ├── app.ts             # Application lifecycle
│       │   │   ├── windows/           # Window creation and configuration
│       │   │   ├── ipc/               # Thin, feature-owned IPC handlers
│       │   │   ├── services/           # Main-process application services
│       │   │   └── persistence/        # User-data and storage adapters
│       │   └── preload/
│       │       ├── index.ts            # Preload entry point
│       │       ├── api.ts              # Minimal contextBridge API
│       │       └── types.ts            # Preload API type surface
│       ├── resources/                  # Desktop icons, tray, and splash assets
│       ├── forge.config.ts
│       ├── vite.main.config.ts
│       ├── vite.preload.config.ts
│       ├── vite.ui.config.ts
│       └── package.json
├── packages/
│   ├── shared/
│   │   ├── ipc/                        # Channels, contracts, and API types
│   │   ├── models/                     # Shared domain models
│   │   └── validation/                 # Runtime validation at boundaries
│   └── ui/
│       ├── index.html
│       ├── vite.config.ts          # Standalone Vue/Vite configuration
│       ├── tsconfig.json           # UI-only type checking
│       └── src/
│           ├── app/                    # Root Vue application
│           ├── components/             # Reusable UI components
│           ├── layouts/                # Page shells
│           ├── pages/                  # Page-level views
│           ├── stores/                 # UI state and orchestration
│           ├── api/                    # Client-facing adapters
│           ├── assets/                 # Static UI assets
│           └── composables/             # Reusable Vue composables
├── scripts/                            # Build and maintenance scripts
├── tests/                              # Unit and integration tests
└── package.json                        # Workspace scripts and boundaries
```

`apps/desktop` owns the Electron shell and packaging. `packages/ui` owns the Vue application rendered inside that shell and can also run as a standalone browser app using its development adapter. A future client can provide another adapter over the same shared contracts without moving desktop-specific resources or main-process code.

## IPC flow

New features should follow this direction:

```text
Vue page/component in packages/ui
      ↓
packages/ui/src/api/electron.ts
      ↓
apps/desktop/electron/preload/api.ts
      ↓
apps/desktop/electron/main/ipc/<feature>.ts
      ↓
apps/desktop/electron/main/services/<feature>-service.ts
      ↓
persistence, OS APIs, or child processes
```

Shared channels, requests, responses, and models belong in `packages/shared`. Keep business logic out of IPC handlers. Expose only the operation the UI needs from the preload bridge, and put privileged work in a main-process service.

When adding another client, provide a client-specific adapter behind the same shared contracts rather than importing Electron APIs into shared components.

## Security model

The default `BrowserWindow` configuration is intentionally restrictive:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- only the explicitly listed methods are exposed through `window.api`
- no raw `ipcRenderer` or Node APIs are exposed to the UI package
- settings payloads are validated again in the main process

Treat every UI value as untrusted input. Add runtime validation for new IPC payloads, keep privileged work in the desktop app, and avoid loading remote content into the application window.

## Adding a feature

1. Add shared models and IPC contracts under `packages/shared/`.
2. Add one handler module under `apps/desktop/electron/main/ipc/` and register it in `ipc/index.ts`.
3. Put filesystem, process, or OS work in `apps/desktop/electron/main/services/` and `persistence/`.
4. Expose the smallest possible method from `apps/desktop/electron/preload/api.ts`.
5. Add or update a client adapter under `packages/ui/src/api/` so Vue code does not import Electron directly.
6. Build pages and components under `packages/ui/src/`.
7. Run `npm run check`.

## License

MIT
