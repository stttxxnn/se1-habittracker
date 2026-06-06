<script setup lang="ts">
import { nextTick, ref } from 'vue'
import HomeView from '@/presentation/views/HomeView.vue'
import HabitCreateView from '@/presentation/views/HabitCreateView.vue'
import SettingsView from '@/presentation/views/SettingsView.vue'
import CalendarView from '@/presentation/views/CalendarView.vue'
import AnalyticsView from '@/presentation/views/AnalyticsView.vue'

const currentView = ref('home')

async function changeView(view: string) {
  currentView.value = view

  await nextTick()

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  })
}
</script>

<template>
  <HomeView
    v-if="currentView === 'home'"
    @changeView="changeView"
  />

  <HabitCreateView
    v-else-if="currentView === 'habitCreate'"
    @changeView="changeView"
  />

  <SettingsView
    v-else-if="currentView === 'settings'"
    @changeView="changeView"
  />

  <CalendarView
    v-else-if="currentView === 'calendar'"
    @changeView="changeView"
  />

  <AnalyticsView
    v-else-if="currentView === 'analytics'"
    @changeView="changeView"
  />
</template>
