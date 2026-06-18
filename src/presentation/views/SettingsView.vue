<script setup lang="ts">
import labels from '@/presentation/locales/en.json'
import BottomNav from '@/presentation/components/BottomNav.vue'

// Aktuell aktive View, um den passenden Tab in der Navigation hervorzuheben
defineProps<{
  currentView: string
}>()

// Event zum Wechseln zwischen Views
defineEmits<{
  changeView: [view: string]
}>()
</script>

<template>
  <main class="app-screen">
    <!-- Seitenkopf mit Zurück-Button -->
    <header class="app-page-header">
      <button
        class="app-back-button"
        type="button"
        @click="$emit('changeView', 'home')"
      >
        ←
      </button>

      <h1 class="app-page-title">{{ labels.settings.title }}</h1>
    </header>

    <!-- Einstellungen als einfache Liste im Wireframe-Stil -->
    <section class="app-card settings-list">
      <button type="button">
        {{ labels.settings.account }}
      </button>

      <button
        v-for="item in 7"
        :key="item"
        type="button"
      >
        {{ labels.settings.notifications }}
      </button>
    </section>

     <!-- Untere Navigation -->
    <BottomNav :current-view="currentView" @changeView="$emit('changeView', $event)" />
  </main>
</template>

<style scoped>
/* Zeilen der Settings-Liste */
.settings-list button {
  width: 100%;
  padding: 14px;
  border: none;
  border-bottom: 1px solid #aaa;
  background: transparent;
  text-align: left;
}

/* Bei der letzten Zeile wird keine Trennlinie angezeigt */
.settings-list button:last-child {
  border-bottom: none;
}
</style>