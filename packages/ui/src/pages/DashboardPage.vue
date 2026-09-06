<script setup lang="ts">
import { computed, ref } from 'vue';
import SessionRow from '../components/SessionRow.vue';
import StatCard from '../components/StatCard.vue';
import { appState, toggleSession, updateLaunchAtLogin } from '../stores/useAppStore';

const savedNotice = ref(false);

const runningSessions = computed(() => appState.sessions.filter((session) => session.status === 'running'));

const runtime = computed(() => {
  if (!appState.appInfo) {
    return 'Loading';
  }

  return `${appState.appInfo.platform} · Electron ${appState.appInfo.electronVersion}`;
});

const latestActivity = computed(() => {
  const latest = [...appState.sessions].sort(
    (left, right) => new Date(right.lastActivityAt).getTime() - new Date(left.lastActivityAt).getTime(),
  )[0];

  return latest ? formatTime(latest.lastActivityAt) : 'No activity yet';
});

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

async function handleLaunchAtLogin(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  await updateLaunchAtLogin(input.checked);
  savedNotice.value = true;
  window.setTimeout(() => {
    savedNotice.value = false;
  }, 2200);
}

async function startAvailableSession(): Promise<void> {
  const session = appState.sessions.find((item) => item.status !== 'running');
  if (session) {
    await toggleSession(session);
  }
}
</script>

<template>
  <section class="dashboard page-container">
    <div class="page-heading">
      <div>
        <p class="eyebrow">Monday, June 02, 2025</p>
        <h1>Good morning, maker<span class="heading-accent">.</span></h1>
        <p class="page-subtitle">A calm place to see what is running and decide what comes next.</p>
      </div>
      <button class="primary-button" type="button" @click="startAvailableSession">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
        </svg>
        Start a session
      </button>
    </div>

    <p v-if="appState.error" class="error-banner" role="alert">
      {{ appState.error }}
    </p>

    <div class="stats-grid">
      <StatCard
        label="Active sessions"
        :value="`${runningSessions.length}`.padStart(2, '0')"
        detail="Everything looks healthy"
        tone="violet"
      />
      <StatCard label="Workspace health" value="98%" detail="Up 4% from yesterday" tone="mint" />
      <StatCard label="Latest activity" :value="latestActivity" detail="Across all workspaces" tone="amber" />
      <StatCard label="Runtime" :value="appState.appInfo?.version ?? '—'" :detail="runtime" tone="blue" />
    </div>

    <div class="dashboard-grid">
      <section class="panel panel--sessions">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Live now</p>
            <h2>Your sessions</h2>
          </div>
          <button class="quiet-button" type="button">View all <span>↗</span></button>
        </div>
        <div v-if="appState.isLoading" class="loading-state">Loading sessions…</div>
        <div v-else class="session-list">
          <SessionRow
            v-for="session in appState.sessions"
            :key="session.id"
            :session="session"
            @toggle="toggleSession"
          />
        </div>
        <div class="panel-footer">
          <span class="footer-pulse"></span>
          Changes are saved automatically
        </div>
      </section>

      <section class="panel panel--settings">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Quick preferences</p>
            <h2>Make it yours</h2>
          </div>
          <span v-if="savedNotice" class="saved-label">Saved</span>
        </div>
        <div class="preference-list">
          <label class="preference-row">
            <span class="preference-icon preference-icon--sun">☼</span>
            <span class="preference-copy">
              <strong>Theme</strong>
              <small>Follow your system preference</small>
            </span>
            <span class="preference-value">System</span>
          </label>
          <label class="preference-row preference-row--toggle">
            <span class="preference-icon preference-icon--bolt">✦</span>
            <span class="preference-copy">
              <strong>Launch at login</strong>
              <small>Keep your workspace close</small>
            </span>
            <input type="checkbox" :checked="appState.settings.launchAtLogin" @change="handleLaunchAtLogin" />
            <span class="toggle-control" aria-hidden="true"></span>
          </label>
        </div>
        <div class="tip-card">
          <span class="tip-card__icon">✳</span>
          <div>
            <strong>Build with intention</strong>
            <p>This panel is a small example of a typed IPC-backed setting.</p>
          </div>
        </div>
      </section>
    </div>

    <section class="activity-strip">
      <div class="activity-strip__label">
        <span class="activity-icon">↯</span>
        <div>
          <p class="eyebrow">Behind the glass</p>
          <strong>Electron is doing the quiet work</strong>
        </div>
      </div>
      <div class="activity-points">
        <span><i class="activity-point activity-point--green"></i>Secure preload bridge</span>
        <span><i class="activity-point activity-point--purple"></i>Vue UI package</span>
        <span><i class="activity-point activity-point--orange"></i>Vite hot reload</span>
      </div>
    </section>
  </section>
</template>
