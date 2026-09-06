<script setup lang="ts">
import SidebarNav from '../components/SidebarNav.vue';
</script>

<template>
  <div class="app-shell">
    <SidebarNav />
    <main class="content-area">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Workspace</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m6 3 5 5-5 5" />
          </svg>
          <strong>Overview</strong>
        </div>
        <div class="topbar__actions">
          <span class="connection-status">
            <span class="connection-status__dot"></span>
            Local runtime
          </span>
          <div class="avatar" aria-label="Current user">EV</div>
        </div>
      </header>
      <slot />
    </main>
  </div>
</template>
