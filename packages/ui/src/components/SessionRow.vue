<script setup lang="ts">
import type { Session } from '@template/shared/models/session';

defineProps<{
  session: Session;
}>();

defineEmits<{
  toggle: [session: Session];
}>();
</script>

<template>
  <article class="session-row">
    <div class="session-row__icon" :class="`session-row__icon--${session.status}`">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 3v2h6V6H9Zm0 5v2h6v-2H9Zm0 5v2h3v-2H9Z"
        />
      </svg>
    </div>
    <div class="session-row__details">
      <strong>{{ session.name }}</strong>
      <span>{{ session.description }}</span>
    </div>
    <div class="session-row__status">
      <span class="status-dot" :class="`status-dot--${session.status}`"></span>
      <span>{{ session.status === 'running' ? 'Running' : 'Idle' }}</span>
    </div>
    <button
      class="session-row__action"
      type="button"
      :aria-label="session.status === 'running' ? `Pause ${session.name}` : `Start ${session.name}`"
      @click="$emit('toggle', session)"
    >
      <svg v-if="session.status === 'running'" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8 5 11 7-11 7V5Z" />
      </svg>
    </button>
  </article>
</template>
