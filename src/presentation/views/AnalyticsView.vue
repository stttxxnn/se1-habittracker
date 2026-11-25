<script setup lang="ts">
import { computed, onMounted } from 'vue'
import labels from '@/presentation/locales/en.json'
import BottomNav from '@/presentation/components/BottomNav.vue'
import { useHabitStore } from '@/presentation/stores/habitStore'
import { addDays } from '@/domain/rules/calendarDay'
import { buildHeatmap, type HeatmapDay } from '@/domain/rules/heatmap'

// Aktuell aktive View, um den passenden Tab in der Navigation hervorzuheben
defineProps<{
  currentView: string
}>()

// Event zum Wechseln zwischen Views
defineEmits<{
  changeView: [view: string]
}>()

const habitStore = useHabitStore()

// Längste aktuelle Streak und höchster Rekord über alle Habits (Berechnung im Store/Domäne)
const streakValue = computed(() =>
  Math.max(0, ...Object.values(habitStore.streaks).map(s => s.current))
)
const bestStreak = computed(() =>
  Math.max(0, ...Object.values(habitStore.streaks).map(s => s.best))
)
const isNewRecord = computed(() => streakValue.value > 0 && streakValue.value >= bestStreak.value)

onMounted(async () => {
  if (habitStore.habits.length === 0) await habitStore.loadAllHabits()
  if (Object.keys(habitStore.completedDatesByHabit).length === 0) await habitStore.loadCompletionHistory()
})

// Zeitraum der Heatmap bewusst klein gehalten (Aufgabe #109 / F-016). Zusätzlich
// bewusst nur 4 statt 7 Wochentage pro Spalte, damit das Raster eher ein breites
// Rechteck als ein Quadrat ist, ohne die einzelnen Zellen zu verkleinern — dafür
// bleiben 3 Wochentage pro Woche unsichtbar, siehe Rückfrage mit Daniel am 2026-11-25.
const HEATMAP_COLUMNS = 8 // Spalten, bestimmt zusammen mit der Kartenbreite die Zellengröße
const HEATMAP_ROWS = 4 // Zeilen pro Spalte (von 7 möglichen Wochentagen)
const HEATMAP_DAYS = HEATMAP_COLUMNS * HEATMAP_ROWS

// Die letzten HEATMAP_DAYS Kalendertage, chronologisch (älteste zuerst)
const heatmapRange = computed<Date[]>(() => {
  const today = new Date()
  const days: Date[] = []
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    days.push(addDays(today, -i))
  }
  return days
})

// Anzahl erledigter Habits pro Kalendertag, aus completedDatesByHabit aggregiert.
// Pro Datum zählt jedes Habit nur einmal, auch falls completedDatesByHabit (theoretisch)
// doppelte Einträge enthält.
const completedCountByDate = computed<Map<string, number>>(() => {
  const counts = new Map<string, number>()
  for (const dates of Object.values(habitStore.completedDatesByHabit)) {
    for (const date of new Set(dates)) {
      counts.set(date, (counts.get(date) ?? 0) + 1)
    }
  }
  return counts
})

// Reine Domänenfunktion (siehe src/domain/rules/heatmap.ts) bekommt nur Daten,
// kein Store- oder Datumszugriff darin.
const heatmap = computed<HeatmapDay[]>(() =>
  buildHeatmap(habitStore.habits, completedCountByDate.value, heatmapRange.value)
)

// Tooltip-Text pro Tag, z. B. "2026-11-25: 3 / 4 Habits"
function heatmapTooltip(day: HeatmapDay): string {
  return `${day.date}: ${day.completed} / ${day.scheduled} ${labels.analytics.habits}`
}
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
        <small v-if="isNewRecord">{{ labels.analytics.newRecord }}</small>
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

    <!-- Heatmap der letzten 8 Wochen: dunkleres Grün = höherer Anteil erledigter Habits -->
    <section class="app-card analytics-heatmap">
      <span
        v-for="day in heatmap"
        :key="day.date"
        :class="['heatmap-cell', `heatmap-level-${day.level}`]"
        :title="heatmapTooltip(day)"
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

/* Heatmap: 4 Zeilen (von 7 Wochentagen), 8 Spalten. grid-auto-flow: column füllt
   jede Spalte erst komplett von oben nach unten, bevor die nächste Spalte
   beginnt — die Tage werden dafür chronologisch (älteste zuerst) übergeben.
   Bewusst 4 statt 7 Zeilen, damit das Raster ein Rechteck statt eines fast
   quadratischen Blocks ist. grid-auto-columns bleibt bei 1fr und die Spaltenzahl
   bei 8, damit sich die Zellengröße dadurch NICHT ändert (nur weniger Zeilen
   insgesamt, nicht kleinere Zellen). */
.analytics-heatmap {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(4, 1fr);
  grid-auto-columns: 1fr;
  gap: 6px;
  padding: 12px;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 3px;
}

/* Fünf Intensitätsstufen nach Anteil erledigter/eingeplanter Habits (levelFor) */
.heatmap-level-0 {
  background: #ebedf0;
}

.heatmap-level-1 {
  background: #9be9a8;
}

.heatmap-level-2 {
  background: #40c463;
}

.heatmap-level-3 {
  background: #30a14e;
}

.heatmap-level-4 {
  background: #216e39;
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
