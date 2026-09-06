<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div>
        <strong>Northstar</strong>
        <span>Electron template</span>
      </div>
    </div>

    <nav class="primary-nav" aria-label="Primary navigation">
      <p class="nav-label">Workspace</p>
      <button class="nav-item nav-item--active" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" />
        </svg>
        Overview
      </button>
      <button class="nav-item" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1 4v2h12V8H6Zm0 4v2h8v-2H6Z"
          />
        </svg>
        Sessions
        <span class="nav-count">3</span>
      </button>
      <button class="nav-item" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m19.43 12.98 1.25 1.01-1.5 2.6-1.56-.63a7.2 7.2 0 0 1-1.35.78L16 18.4h-3l-.27-1.66a7.2 7.2 0 0 1-1.35-.78l-1.56.63-1.5-2.6 1.25-1.01a6.8 6.8 0 0 1 0-1.96L8.32 10l1.5-2.6 1.56.63c.42-.32.87-.58 1.35-.78L13 5.6h3l.27 1.66c.48.2.93.46 1.35.78l1.56-.63 1.5 2.6-1.25 1.02c.07.32.1.65.1.98s-.03.66-.1.98ZM14.5 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          />
        </svg>
        Settings
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="runtime-card">
        <span class="runtime-card__dot"></span>
        <div>
          <strong>Local runtime</strong>
          <span>Connected and ready</span>
        </div>
      </div>
      <p class="version-label">Template v1.0.0</p>
    </div>
  </aside>
</template>
