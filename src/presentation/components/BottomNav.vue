<script setup lang="ts">
// Zentrale UI-Texte für die Navigationslabels
import labels from '@/presentation/locales/en.json'

// Aktuell aktive View, um den passenden Tab hervorzuheben
defineProps<{
  currentView: string
}>()

// Event zum Wechseln zwischen den Views
defineEmits<{
  changeView: [view: string]
}>()
</script>

<template>
  <!-- Wiederverwendbare untere Navigation für die wichtigsten App-Bereiche -->
  <nav class="bottom-nav">
    <button
      type="button"
      :class="{ active: currentView === 'analytics' }"
      @click="$emit('changeView', 'analytics')"
    >
      <span class="nav-icon">⌁</span>
      <span>{{ labels.navigation.analytics }}</span>
    </button>

    <button
      type="button"
      :class="{ active: currentView === 'home' }"
      @click="$emit('changeView', 'home')"
    >
      <span class="nav-icon">⌂</span>
      <span>{{ labels.navigation.home }}</span>
    </button>
  </nav>
</template>

<style scoped>
/* Fixierte Navigation am unteren Bildschirmrand */
.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 360px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 14px 0;
  background: #ddd5ff;
  border-radius: 40px;
}

.bottom-nav button {
    border: none;
    background: transparent;
    color: #555555;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
}

/* Hervorhebung des aktuell aktiven Tabs */
.bottom-nav button.active {
    color: #7437d8;
}

.bottom-nav button.active .nav-icon {
    transform: scale(1.15);
}

.nav-icon {
  font-size: 24px;
  line-height: 1;
}
</style>
