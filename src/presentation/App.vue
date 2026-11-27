<script setup lang="ts">
import { nextTick, ref } from 'vue'

const currentView = ref('home')

async function changeView(view: string) {
  /*currentView.value = view

  await nextTick()

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  })*/
}

</script>


<template>
  <!--here all paths will be resolved-->
  <RouterView />
  
  <!--<HomeView
    v-if="currentView === 'home'"
    :current-view="currentView"
    @changeView="changeView"
  />

  <HabitCreateView
    v-else-if="currentView === 'habitCreate'"
    @changeView="changeView"
  />

  <HabitEditView
    v-else-if="currentView === 'habitEdit'"
    @changeView="changeView"
  />

  <HabitDeleteView
    v-else-if="currentView === 'habitDelete'"
    @changeView="changeView"
  />

  <SettingsView
    v-else-if="currentView === 'settings'"
    :current-view="currentView"
    @changeView="changeView"
  />

  <AnalyticsView
    v-else-if="currentView === 'analytics'"
    :current-view="currentView"
    @changeView="changeView"
  /> -->
</template>
