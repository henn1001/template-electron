<script setup lang="ts">
import { onMounted } from 'vue';
import AppShell from '../layouts/AppShell.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import { loadDashboard } from '../stores/useAppStore';

onMounted(() => {
  void loadDashboard();
});
</script>

<template>
  <AppShell>
    <DashboardPage />
  </AppShell>
</template>
