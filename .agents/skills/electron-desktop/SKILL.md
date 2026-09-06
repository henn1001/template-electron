---
name: electron-desktop
description: Use when building, modifying, reviewing, testing, or packaging an Electron desktop application. Covers secure main/renderer/preload boundaries, capability-oriented IPC, services and adapters, persistence, lifecycle, child processes, UI integration, and release verification.
---

# Electron desktop applications

Use this skill when building, changing, reviewing, testing, or packaging an Electron application.

These are portable defaults, not a fixed project layout. Apply them to the codebase being changed; preserve its established package names, paths, commands, UI framework, and build tools unless they conflict with a security or correctness requirement. Inspect the codebase before making assumptions.

## Priorities

Apply guidance in this order:

1. Preserve the trust boundaries and security defaults.
2. Keep data contracts, lifecycle, and failure behavior explicit.
3. Preserve the codebase's established architecture and tooling.
4. Prefer the smallest change that makes ownership clear.
5. Add layers or abstractions only when they reduce coupling or make behavior testable.

## Mental model

An Electron application is a web application hosted by a privileged desktop shell. Treat each process and boundary deliberately:

```text
Renderer / web UI
        ↓ client adapter or UI service
Preload / capability bridge
        ↓ narrow IPC messages
Main process / application orchestrator
        ↓
Application services
        ↓
Persistence, OS APIs, network clients, child processes, or native modules
```

- **Renderer**: untrusted presentation code. It renders state, collects intent, and uses an application API. It must not have ambient Node.js or Electron access.
- **Preload**: the security boundary. It exposes a small, capability-oriented API with `contextBridge`; it is not a general-purpose backend and should contain little or no business logic.
- **Main process**: the privileged orchestrator. It owns windows, application lifecycle, authorization decisions, OS integration, and coordination of services.
- **Services**: application workflows and domain decisions. They should be testable without constructing a `BrowserWindow` or importing renderer code.
- **Adapters**: filesystem, database, network, OS, and child-process implementations. They isolate platform and infrastructure details from product behavior.
- **Shared code**: contracts, DTOs, schemas, pure domain types, and constants that can safely be used by multiple layers. It must not import Electron, Node-only modules, or browser globals.

Not every application needs every layer. A small feature may go directly from a validated handler to a focused adapter. Introduce a service when it owns a workflow, invariant, or lifecycle—not merely because a directory exists.

## Inspect before editing

Before making an architectural change in an existing codebase:

- Check `git status` and avoid overwriting unrelated user changes.
- Read the root and relevant package manifests, scripts, TypeScript configuration, bundler configuration, and the nearest analogous implementation.
- Identify the main, preload, renderer, worker, and test entry points. Do not infer them from a familiar Electron template.
- Determine whether the project uses a single package, workspaces, a monorepo, Electron Forge, electron-builder, a custom bundler, or another setup.
- Find the existing `BrowserWindow` security options, IPC registration, persistence conventions, logging, and shutdown handling.
- Treat generated output, packaged artifacts, `node_modules`, and build caches as disposable; do not edit them by hand.
- Use the codebase's existing scripts for verification. Do not claim that a generic command such as `npm test` or a particular packaging target exists without checking.

When an existing design is sound, extend it rather than performing a broad structural rewrite. Use this skill to identify responsibilities and risks, not to force a particular folder tree.

## Recommended responsibility layout

A common single-package layout is:

```text
src/
├── main/
│   ├── bootstrap
│   ├── windows/
│   ├── ipc/
│   ├── services/
│   └── adapters/
├── preload/
├── renderer/
└── shared/
```

A workspace layout may separate the same responsibilities into a desktop application, a UI package, and a shared package:

```text
apps/<desktop-app>/  # main, preload, packaging, resources
packages/<ui>/       # renderer application and client adapters
packages/<shared>/   # pure contracts, models, schemas
```

These are conventions, not requirements. Name directories according to the repository and organize large applications by feature when that makes ownership clearer. Keep the dependency direction understandable:

```text
renderer → client API → preload → IPC handler → service → adapter
                         shared contracts may be used by both sides
```

Avoid imports in the reverse direction. In particular:

- renderer code must not import main or preload implementation modules;
- shared code must not import `electron`, `node:*`, or browser-only APIs;
- preload must not become a hidden import path for arbitrary main-process functionality;
- infrastructure adapters should not decide product policy that belongs in a service.

## Security baseline

Start from a restrictive `BrowserWindow` configuration and loosen it only for a documented requirement:

```ts
new BrowserWindow({
  webPreferences: {
    preload,
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    // Keep web security enabled; it is the default.
  },
});
```

The exact options must be compatible with the Electron version and application. The baseline rules are:

- Keep `contextIsolation: true` and `nodeIntegration: false`.
- Keep the preload sandbox enabled where the application supports it; if it must be disabled, document why and review the resulting preload capabilities.
- Never expose `ipcRenderer`, `require`, `process`, `fs`, `path`, `child_process`, `shell`, or a broad Node/Electron object to the renderer.
- Never expose a generic `send`, `invoke`, channel dispatcher, filesystem API, command runner, or arbitrary URL opener. Expose named operations that represent approved use cases.
- Do not disable `webSecurity`, enable insecure content, or use `eval` or load executable code from untrusted sources as a convenience. Bundled dynamic imports are a separate, reviewable build concern.
- Treat bundled renderer code as untrusted at the process boundary. TypeScript types are not validation and renderer-side checks are not authorization.
- Validate and authorize requests in the main process before touching files, processes, credentials, network resources, or other privileged capabilities.
- For sensitive handlers, verify that the sender is a window/frame created by the application and that its URL/origin is expected. Do not use a renderer-provided user ID, role, or capability as proof of authorization.
- Load only expected local content in application windows. Prevent unexpected navigation and new windows; route intentionally external links through a narrow, validated policy.
- If remote content is unavoidable, isolate it from the privileged application window, give it no privileged preload, restrict navigation and permissions, and define its origin and CSP explicitly.
- Add a production Content Security Policy. Avoid `unsafe-eval` and `unsafe-inline` unless a specific tool requires them and the exception is understood.
- Handle permission requests explicitly when the application uses camera, microphone, geolocation, notifications, or other privileged web capabilities.
- Keep secrets out of renderer state, logs, URLs, command-line arguments, source code, and unencrypted settings files. Use OS-backed credential storage such as Electron `safeStorage` or a platform keychain where appropriate.
- Keep Electron and dependencies current, lock dependencies, review security advisories, and do not treat a local desktop app as inherently safe from malicious files, links, plugins, or compromised content.

Security settings are necessary but not sufficient. A trusted preload that forwards arbitrary renderer input to a powerful main-process function is still an unsafe bridge.

## Process and module conventions

### Main bootstrap and lifecycle

Keep startup orchestration separate from feature logic:

1. Establish any single-instance policy before creating windows if the product requires one.
2. Wait for `app.whenReady()`.
3. Initialize dependencies and migrations that require Electron readiness.
4. Register IPC handlers exactly once.
5. Create the initial window(s).
6. Register lifecycle handlers and service shutdown hooks.
7. Handle startup failure visibly and exit cleanly rather than leaving a half-initialized application running.

Keep window factories focused. A window module should own its dimensions, preload path, content loading, and window-specific events; it should not contain unrelated application workflows. Keep application lifecycle policy in a lifecycle module or small coordinator.

Account for platform behavior:

- On macOS, applications commonly remain open after the last window closes and recreate a window on activation.
- On other platforms, closing the last window commonly quits, unless the product intentionally uses a tray/background mode.
- If the app has a tray, background service, or multiple windows, define which resources keep the app alive and how the user exits it.
- Retain and release `BrowserWindow` references deliberately. Do not let a window close while long-lived listeners or subscriptions still hold stale state.
- Stop child processes, sockets, file watchers, timers, and event subscriptions during shutdown. Make cleanup idempotent because quit, crash, and window-close paths can overlap.

Do not block the main process with expensive CPU work or synchronous filesystem operations on interactive paths. Use asynchronous I/O and move CPU-heavy or isolated work to a worker, utility process, or external process.

### Feature-oriented main code

Prefer small, feature-owned IPC modules and services over one giant `main.ts` or `ipc.ts`:

```text
main/
├── ipc/
│   ├── settings.ts
│   ├── projects.ts
│   └── index.ts          # registration/composition only
├── services/
│   ├── settings-service.ts
│   └── project-service.ts
└── adapters/
    ├── settings-store.ts
    └── process-runner.ts
```

The registration module should compose handlers, not implement behavior. A handler should normally do only this:

1. identify and validate the sender when needed;
2. parse the untrusted request;
3. call one service operation;
4. return a serializable result or a safe error.

Put product decisions, state transitions, authorization, retries, and orchestration in services. Put serialization, paths, OS calls, and third-party SDK details in adapters. Inject adapters into services when practical so services can be unit-tested without Electron.

Avoid uncontrolled mutable singletons. If a singleton is appropriate for a process-wide resource, give it an explicit lifecycle, ownership, and reset/cleanup behavior. Make operations idempotent where startup retries or duplicate user actions are possible.

## IPC conventions

### Shape the API around capabilities

The preload API should describe what the UI is allowed to do, not mirror Electron or expose transport primitives:

```ts
contextBridge.exposeInMainWorld('desktop', {
  settings: {
    load: () => ipcRenderer.invoke(CHANNELS.settings.load),
    save: (input: SaveSettingsInput) => ipcRenderer.invoke(CHANNELS.settings.save, input),
  },
  projects: {
    export: (input: ExportProjectInput) => ipcRenderer.invoke(CHANNELS.projects.export, input),
  },
});
```

`settings.save` and `projects.export` are capabilities. `desktop.invoke(channel, payload)` is not.

Keep the bridge in one preload module or one clearly owned API module. Export the smallest surface needed by the renderer. Keep renderer-facing types aligned with the actual bridge, preferably from a pure shared contract or a type derived from it.

### Contracts and validation

For every operation, define:

- a namespaced channel such as `projects:export` or `settings:load`;
- a request DTO and response DTO, or a documented event payload;
- runtime validation for every value crossing into the main process;
- an error contract or stable error codes where the UI needs to react to failure.

Centralize channel names or use a typed channel registry so strings cannot silently diverge between main and preload. Organize handlers by feature rather than by transport primitive.

Use `unknown` at an untrusted boundary and parse it with a schema library or a focused type guard. Validate more than shape when relevant:

- maximum sizes and lengths;
- enum and identifier membership;
- numeric ranges and dates;
- path roots and traversal attempts;
- URLs, protocols, and allowed hosts;
- permissions and resource ownership;
- combinations of fields that are invalid together.

Validate again in the main process even if the renderer uses the same schema. A shared TypeScript type or schema improves consistency but does not make a caller trusted.

Prefer structured-clone-compatible DTOs: primitives, arrays, plain objects, and explicit serialized dates or identifiers. Do not rely on class instances, functions, DOM objects, live handles, or implicit `Date` behavior crossing IPC.

### Requests, events, and errors

- Use `ipcRenderer.invoke`/`ipcMain.handle` for normal request/response operations. It gives the caller a clear completion and failure path.
- Use event-style messages only for genuine notifications, subscriptions, progress, or streams. Define who owns the listener, when it starts, how it is removed, and how backpressure or missed events are handled.
- Expose subscription methods that return an unsubscribe function or otherwise make cleanup explicit. Do not leak `ipcRenderer.on` listeners into UI components.
- Route main-to-renderer events to the intended window; do not broadcast sensitive data to every window by default.
- Do not send secrets or verbose internal errors over IPC. Log diagnostic context in the main process and return a stable, user-safe error code/message.
- Do not assume thrown errors retain custom prototypes or complete details across IPC. Normalize errors at the process boundary.
- Make timeouts, cancellation, retries, and duplicate requests explicit for operations that can hang or change state.

A typical handler shape is:

```ts
ipcMain.handle(CHANNELS.projects.rename, async (event, raw: unknown) => {
  assertTrustedSender(event);
  const input = RenameProjectSchema.parse(raw);
  return projectService.rename(input);
});
```

The exact validation library and sender check depend on the project. The important properties are that the handler does not trust TypeScript annotations and does not contain the workflow itself.

## Renderer and UI conventions

Treat the renderer as a normal web application:

- Keep Electron imports, `node:*` imports, and `window` bridge access out of reusable UI components.
- Put the bridge behind a renderer-side client adapter, repository, composable, or service. This keeps the UI testable and permits a browser, mock, or future desktop client.
- Keep page composition in pages/routes, focused presentation in components, and asynchronous orchestration in stores/composables or a UI service layer.
- Keep the adapter's public behavior semantically aligned across real and mock/browser implementations. A mock should not silently claim to provide a privileged operation that it cannot model.
- Map transport DTOs to view state when that prevents IPC details from leaking through the UI.
- Represent loading, empty, success, failure, and partial states deliberately. Prevent stale responses from overwriting newer state, and cancel or ignore work when its owner is destroyed.
- Use optimistic updates only when rollback and failure behavior are clear; otherwise update from the confirmed main-process result.
- Keep user-facing error messages actionable and avoid displaying internal paths, stack traces, or secrets.
- Preserve semantic HTML, keyboard operation, focus management, labels, visible validation, and appropriate ARIA behavior when adding controls.
- Prefer existing design tokens, components, and state conventions before creating parallel primitives.

When the renderer uses Vue, the normal conventions are `<script setup lang="ts">`, typed props and emits, composables/stores for async state, and components that emit intent rather than calling Electron directly. Equivalent boundaries apply to React, Svelte, Solid, or another web UI framework.

## Persistence and local data

Use Electron's application paths rather than the current working directory or the installation directory:

- `app.getPath('userData')` for application-owned per-user configuration and state;
- appropriate Electron paths for logs, caches, documents, and temporary files;
- packaged resources for read-only bundled assets, resolved through the packaging-aware path APIs.

Only access paths that require Electron after app initialization when the application lifecycle requires it. Keep path selection and serialization inside a persistence adapter; keep product behavior in a service.

For file-backed data:

1. Parse JSON or another format into `unknown`.
2. Validate it against the current schema.
3. Apply explicit, versioned migrations when the schema changes.
4. Handle missing, corrupt, partial, and older data intentionally.
5. Write using an atomic or crash-safe strategy appropriate to the target platforms.
6. Surface write failures instead of reporting a successful save that did not happen.
7. Prevent concurrent writes from losing updates.

Keep backups or recovery information when losing user data would be costly. Do not silently replace unrecognized data with defaults without logging and, where appropriate, preserving the original. Use stable schema versions and idempotent migrations rather than scattered compatibility checks.

Do not put mutable user data inside an `asar` archive or beside the installed executable. Do not store credentials or tokens as plain JSON. `userData` is an application location, not automatically a secure vault; use OS-backed encryption/credential storage for sensitive values and minimize how long secrets live in memory.

## Files, paths, URLs, and OS integration

Any renderer-controlled path, URL, command, or identifier is untrusted:

- Prefer main-process dialogs and well-defined operations over accepting arbitrary filesystem paths from the renderer.
- Resolve paths and verify they remain within an explicitly allowed directory before reading or writing.
- Do not concatenate user input into shell commands. Use `spawn` with an argument array and `shell: false` unless a shell is an explicit, reviewed requirement.
- Validate URL protocols and hosts before opening or fetching them. Use a narrow allowlist for `shell.openExternal`; never turn it into an arbitrary URL or command bridge.
- Avoid following redirects to untrusted origins for sensitive operations unless the policy accounts for them.
- Use OS APIs from the main process and return minimal DTOs, not live native objects or handles.
- Redact tokens, passwords, personal data, and command arguments from logs.

### Child processes and daemons

When Electron coordinates a daemon or helper process, keep it behind a focused process manager or adapter. Define:

- how the executable is located in development and in a packaged application;
- platform-specific arguments, permissions, and environment variables;
- readiness/health detection before requests are sent;
- stdout/stderr handling and log size/backpressure policy;
- timeouts, retries, crash recovery, and a clear state machine;
- graceful shutdown, forced termination, and process-group cleanup;
- behavior during app restart, update, partial startup, and failed shutdown.

Do not assume a child process will exit just because its window closed. Never execute an untrusted downloaded executable without a separate trust, signature, and update design. Keep daemon protocol contracts separate from renderer concerns so another client can reuse the backend if needed.

## Windows and navigation

For each window, decide explicitly:

- which local entry point it loads in development and production;
- which preload capability set it receives;
- whether it is allowed to navigate, open child windows, or access external content;
- how it is created, reused, focused, and destroyed;
- what state is safe to restore from persisted window bounds;
- which main-process resources it subscribes to and how those subscriptions are removed.

Validate restored window positions and sizes against available displays; persisted window state is data, not trusted configuration. Use `setWindowOpenHandler` and navigation guards where appropriate. External links should be opened by an intentional, validated action—not by allowing the application window to navigate away from its trusted content.

## Build, packaging, and release

Do not assume that a development run proves the packaged application works. Check both paths:

- development server loading versus packaged local files;
- preload path and bundling behavior;
- asset and resource resolution;
- `app.isPackaged` behavior;
- native module rebuilding for the target Electron ABI;
- writable user-data paths versus read-only packaged resources;
- production CSP, permissions, and update configuration.

Follow the selected packager (Electron Forge, electron-builder, or another tool). Keep entry points and output directories explicit, avoid packaging caches and secrets, and use `asar` or an equivalent archive where compatible. Files that must be accessed as real files at runtime—such as native binaries or selected helper resources—need an intentional unpacking/resource strategy.

For releases:

- use a stable application identifier and product metadata;
- code-sign and notarize/sign installers according to each target platform;
- build native artifacts on supported target environments or use a verified cross-build setup;
- test installation, first launch, upgrade, downgrade policy, uninstall, and data migration;
- protect auto-update metadata and artifacts with HTTPS and appropriate signatures; never execute arbitrary downloaded content;
- review Electron, Chromium, native dependencies, and third-party packages before release;
- keep platform targets and claims honest—an AppImage build is not automatically a Windows or macOS release.

Use Electron hardening options such as security fuses only when supported by the chosen packaging flow and verified in the packaged artifact. Packaging configuration is part of the security boundary, not just release plumbing.

## Testing and verification

Test at the boundary where behavior can fail:

- **Unit tests** for pure validation, domain logic, state machines, migrations, and adapters with deterministic dependencies.
- **Main-process integration tests** for services, persistence recovery, child-process lifecycle, and authorization decisions.
- **IPC integration tests** for serialization, invalid payloads, error normalization, sender checks, and handler registration.
- **Renderer tests** for stores/composables, loading and failure states, and accessible user flows.
- **End-to-end or packaged-app tests** for preload exposure, window navigation, real resource paths, and production-like startup.
- **Security regression tests** for unexpected navigation/windows, bridge surface, path traversal, unsafe URLs, malformed data, and privileged operations from an untrusted caller.

At minimum, before finishing a change:

- run the codebase's type checks, lint, tests, and relevant UI/build checks;
- exercise both the desktop path and any standalone/browser adapter when one exists;
- package the app when the change affects preload, resources, native modules, or release configuration;
- inspect logs and the final artifact for accidental secrets or development-only paths;
- review the diff for generated files, unrelated edits, new broad capabilities, and missing cleanup/error paths.

Do not treat a browser mock as a substitute for Electron integration or packaged-app testing.

## Feature workflow

For a feature that crosses the desktop boundary:

1. **Map ownership.** Decide what belongs to shared contracts, renderer state, preload, IPC, a service, persistence, an OS adapter, or a child process.
2. **Trace the existing path.** Find an analogous feature and follow it end to end before adding a new pattern.
3. **Define the capability.** Choose a specific operation and namespaced channel. Avoid exposing a lower-level primitive than the feature requires.
4. **Define DTOs and schemas.** Make request, response, event, error, and versioning behavior explicit. Add runtime validation at the main boundary.
5. **Implement infrastructure first.** Add or update the persistence/OS/process adapter, then the service that owns the workflow and invariants.
6. **Add a thin handler.** Check the sender where necessary, parse the request, delegate, and normalize failures.
7. **Expose the smallest preload method.** Keep the API typed and capability-oriented; never expose a generic transport object.
8. **Connect the renderer through its adapter/store.** Keep components independent of Electron and cover loading, success, empty, error, and cleanup states.
9. **Review security and lifecycle.** Check paths, URLs, permissions, secrets, navigation, concurrency, cancellation, shutdown, and multi-window behavior.
10. **Verify the real delivery path.** Run the codebase's checks, integration tests, standalone UI checks if relevant, and a packaged build when relevant.

A healthy feature is traceable in one direction:

```text
UI intent
  → renderer client
  → preload capability
  → validated IPC request
  → application service
  → persistence / OS / network / child process
  → serializable result or safe error
```

## Common anti-patterns

Avoid these unless there is a documented, reviewed reason:

- enabling `nodeIntegration` to avoid writing a preload bridge;
- exposing raw `ipcRenderer` or a generic `window.electron` object;
- putting business logic, authorization, or filesystem access in a handler;
- trusting renderer TypeScript types, hidden UI controls, or renderer-side authorization;
- importing Electron or Node APIs into reusable UI or shared code;
- making one giant IPC registry, service, or global store own unrelated features;
- writing user data relative to `process.cwd()`, the source tree, or the installed app;
- using `shell: true` or string-built commands with user input;
- loading arbitrary remote content in a privileged window;
- returning raw exceptions, stack traces, paths, or secrets to the renderer;
- relying on in-memory sample state as if it were durable persistence;
- adding a browser mock that behaves differently enough to hide desktop failures;
- assuming `npm start`, `npm test`, a specific packager, or a specific OS artifact exists;
- editing build output instead of its source;
- adding a new framework, state library, or abstraction when an existing local convention is sufficient.

## Completion checklist

Before considering an Electron change complete, confirm:

- [ ] The codebase's actual entry points, scripts, and conventions were inspected.
- [ ] Renderer, preload, main, service, adapter, and shared responsibilities are clear.
- [ ] `contextIsolation` and `nodeIntegration` remain secure; sandbox and web security were not weakened without review.
- [ ] The preload exposes only named, minimum-privilege capabilities.
- [ ] Every renderer-to-main input is runtime-validated and, where relevant, sender/permission-checked.
- [ ] No renderer or shared module gained Electron, Node, filesystem, shell, or secret access.
- [ ] IPC payloads and errors are serializable, bounded, and safe to display.
- [ ] Persistence uses appropriate application paths, validation, migrations, and failure recovery.
- [ ] URLs, paths, child processes, permissions, navigation, and external links have explicit policies.
- [ ] Long-lived resources have startup, failure, cancellation, and shutdown behavior.
- [ ] Loading, empty, error, accessibility, and cleanup states are covered in the UI.
- [ ] Development and packaged paths were considered; relevant checks and tests pass.
- [ ] No generated output, dependency directory, secrets, or unrelated user changes were modified.
- [ ] The final diff does not introduce a broader capability than the feature requires.
