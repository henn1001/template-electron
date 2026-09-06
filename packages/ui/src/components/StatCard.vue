<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  detail: string;
  tone?: 'violet' | 'mint' | 'amber' | 'blue';
}>();
</script>

<template>
  <article class="stat-card" :class="`stat-card--${tone ?? 'violet'}`">
    <div class="stat-card__topline">
      <span>{{ label }}</span>
      <span class="stat-card__spark" aria-hidden="true"></span>
    </div>
    <strong>{{ value }}</strong>
    <small>{{ detail }}</small>
  </article>
</template>
