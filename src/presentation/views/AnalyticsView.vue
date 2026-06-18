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

// Temporäre Werte für das grobe Analytics-Layout
const streakValue = 75
const heatmapDays = 56
</script>

<template>
  <main class="app-screen">
    <!-- Oberer Streak-Bereich als grobes Wireframe-Skeleton -->
    <section class="app-card analytics-streak-card">
      <div class="analytics-circle">
        <span class="analytics-fire">🔥</span>

        <strong>
          {{ streakValue }} {{ labels.analytics.streakDays }}
        </strong>

        <p>{{ labels.analytics.currentStreak }}</p>
        <small>{{ labels.analytics.newRecord }}</small>
      </div>
    </section>

    <!-- Zeitraum-Tabs für Tag, Woche, Monat und Jahr -->
    <div class="app-tabs analytics-period-tabs">
      <button class="app-tab active" type="button">
        {{ labels.calendar.day }}
      </button>

      <button class="app-tab" type="button">
        {{ labels.calendar.week }}
      </button>

      <button class="app-tab" type="button">
        {{ labels.calendar.month }}
      </button>

      <button class="app-tab" type="button">
        {{ labels.calendar.year }}
      </button>
    </div>

    <!-- Platzhalter für die spätere Heatmap -->
    <section class="app-card analytics-heatmap">
      <span
        v-for="day in heatmapDays"
        :key="day"
        class="heatmap-cell"
      ></span>
    </section>

    <!-- Platzhalter für spätere Habit-Analysen -->
    <section class="app-card">
      <h2 class="app-section-title">{{ labels.analytics.habits }}</h2>

      <div class="analytics-placeholder-row"></div>
      <div class="analytics-placeholder-row"></div>
      <div class="analytics-placeholder-row"></div>
      <div class="analytics-placeholder-row"></div>
    </section>

    <!-- Platzhalter für spätere Korrelationen -->
    <section class="app-card">
      <h2 class="app-section-title">{{ labels.analytics.correlations }}</h2>

      <div class="correlation-placeholder-grid">
        <div class="correlation-placeholder"></div>
        <div class="correlation-placeholder"></div>
      </div>
    </section>

    <!-- Untere Navigation -->
    <BottomNav :current-view="currentView" @changeView="$emit('changeView', $event)" />
  </main>
</template>

<style scoped>
/* Zentriert den großen Streak-Kreis */
.analytics-streak-card {
  display: flex;
  justify-content: center;
}

.analytics-circle {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  border: 6px solid #4ed671;
  outline: 5px solid #5b73e6;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  text-align: center;
}

.analytics-fire {
  font-size: 34px;
}

.analytics-circle strong {
  font-size: 30px;
}

.analytics-circle p {
  margin: 0;
  font-size: 18px;
}

.analytics-circle small {
  color: #555555;
}

/* Vier Tabs für D/W/M/J */
.analytics-period-tabs {
  grid-template-columns: repeat(4, 1fr);
}

/* Grobe Heatmap als Platzhalter */
.analytics-heatmap {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 6px;
  padding: 12px;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 3px;
  background: #58d87b;
}

/* Platzhalter-Zeilen für die spätere Habit-Analyse */
.analytics-placeholder-row {
  height: 38px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 10px;
}

.analytics-placeholder-row:last-child {
  margin-bottom: 0;
}

/* Platzhalter für spätere Korrelationskarten */
.correlation-placeholder-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.correlation-placeholder {
  min-height: 70px;
  background: #ffffff;
  border-radius: 12px;
}
</style>
