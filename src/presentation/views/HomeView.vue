<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'
import BottomNav from '@/presentation/components/BottomNav.vue'

// Aktuell aktive View, um den passenden Tab in der Navigation hervorzuheben
defineProps<{
  currentView: string
}>()

// Event, mit dem diese View zu einer anderen View wechseln kann
const emit = defineEmits<{
  changeView: [view: string]
}>()

// Typ für die Wochentage im kleinen Kalender auf dem Home Screen
type WeekDay = {
  id: number
  label: string
  dayIndex: number
}

// Temporärer User-Typ, solange es noch keine Anmeldung gibt
type User = {
  id: number
  name: string
}

// Typ für die Statistikwerte im oberen Statistikblock
type HomeStats = {
  streakDays: number
  habitsCount: number
  vicesCount: number
}

// Store: enthält Habits, Loading-State und Error-State
const habitStore = useHabitStore()

// IDs der heute bereits abgehakten Habits (nur lokaler Zustand, kein Backend)
const completedHabitIds = ref<Set<string>>(new Set())

// Prüft, ob ein Habit für heute als erledigt markiert ist
function isHabitDone(id: string): boolean {
  return completedHabitIds.value.has(id)
}

// Habit als erledigt/nicht erledigt umschalten
function toggleHabitDone(id: string) {
  const updated = new Set(completedHabitIds.value)

  if (updated.has(id)) {
    updated.delete(id)
  } else {
    updated.add(id)
  }

  completedHabitIds.value = updated
}

// Temporäre Statistikwerte für den oberen Statistikblock
const homeStats = ref<HomeStats>({
  streakDays: 0,
  habitsCount: 0,
  vicesCount: 0
})

// Temporärer Benutzer, später durch echte User-Daten ersetzbar
const user = ref<User>({
  id: 1,
  name: 'Maria Lee'
})

// Aktuelle Zeit, damit Begrüßung, Datum und Tagesfortschritt dynamisch sind
const now = ref<Date>(new Date())

// Begrüßung abhängig von der aktuellen Uhrzeit
const currentGreeting = computed<string>(() => {
  const hour = now.value.getHours()

  if (hour >= 5 && hour < 12) {
    return labels.home.morningGreeting
  }

  if (hour >= 12 && hour < 18) {
    return labels.home.afternoonGreeting
  }

  if (hour >= 18 && hour < 22) {
    return labels.home.eveningGreeting
  }

  return labels.home.nightGreeting
})

// Aktuelles Datum im deutschen Format
const currentDate = computed<string>(() => {
  return now.value.toLocaleDateString('de-DE')
})

// Berechnet, wie viel Prozent des Tages bereits vergangen sind
const currentDayProgress = computed<number>(() => {
  const hours = now.value.getHours()
  const minutes = now.value.getMinutes()
  const seconds = now.value.getSeconds()

  const passedMinutes = hours * 60 + minutes + seconds / 60
  const minutesPerDay = 24 * 60

  return (passedMinutes / minutesPerDay) * 100
})

// Index des heutigen Wochentags für die Markierung im Kalender
const todayIndex = computed<number>(() => {
  return now.value.getDay()
})

// Beschriftungen der Timeline im Tagesplan
const timelineLabels: string[] = ['00:00', '08:00', '16:00', '00:00']

// Wochentage für den kleinen Kalender auf dem Home Screen
const weekDays: WeekDay[] = [
  { id: 1, label: labels.weekdays.mon, dayIndex: 1 },
  { id: 2, label: labels.weekdays.tue, dayIndex: 2 },
  { id: 3, label: labels.weekdays.wed, dayIndex: 3 },
  { id: 4, label: labels.weekdays.thu, dayIndex: 4 },
  { id: 5, label: labels.weekdays.fri, dayIndex: 5 },
  { id: 6, label: labels.weekdays.sat, dayIndex: 6 },
  { id: 7, label: labels.weekdays.sun, dayIndex: 0 }
]

// Timer, damit die aktuelle Zeit regelmäßig aktualisiert werden kann
let clockTimer: number | undefined

// Beim Laden der View: alle Habits aus Supabase laden und Uhr starten
onMounted(async () => {
  await habitStore.loadAllHabits()

  homeStats.value = {
    streakDays: 0,
    habitsCount: habitStore.habits.length,
    vicesCount: 0
  }

  clockTimer = window.setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

// Habit zum Bearbeiten auswählen und zur Edit-View navigieren
function handleEdit(habit: import('@/domain/models/Habit').Habit) {
  habitStore.setHabitToEdit(habit)
  emit('changeView', 'habitEdit')
}

// Beim Verlassen der View: Timer aufräumen
onUnmounted(() => {
  if (clockTimer !== undefined) {
    clearInterval(clockTimer)
  }
})
</script>

<template>
  <main class="app-screen">
    <!-- Header mit Profil, Begrüßung und Settings-Button -->
    <header class="home-header">
      <div class="home-profile">
        <div class="home-avatar"></div>

        <div>
          <h1 class="home-greeting">{{ currentGreeting }}</h1>
          <p class="home-user-name">{{ user.name }}</p>
        </div>
      </div>

      <button class="home-settings-button" type="button" @click="$emit('changeView', 'settings')">
        ⚙
      </button>
    </header>

    <!-- Statistikblock mit Streak, Habits und Vices -->
    <section class="home-stats">
      <div>
        <span>🔥</span>
        <b>{{ homeStats.streakDays }} {{ labels.home.streak }}</b>
      </div>

      <div>
        <span>🎯</span>
        <b>{{ homeStats.habitsCount }} {{ labels.home.habits }}</b>
      </div>

      <div>
        <span>🚬</span>
        <b>{{ homeStats.vicesCount }} {{ labels.home.vices }}</b>
      </div>
    </section>

    <!-- Tagesplan mit Timeline und Habit-Liste aus dem Store -->
    <section class="app-card">
      <p class="date">{{ currentDate }}</p>
      <h2 class="app-section-title">{{ labels.home.todayPlan }}</h2>

      <div class="timeline-box">
        <div class="timeline-labels">
          <span
            v-for="(time, index) in timelineLabels"
            :key="index"
          >
            {{ time }}
          </span>
        </div>

        <div class="timeline-main">
          <div class="timeline-progress" :style="{ width: currentDayProgress + '%' }"></div>
        </div>

        <div class="timeline-events"></div>
      </div>
      
      <!-- Ladezustand, Fehler oder geladene Habits anzeigen -->
      <p v-if="habitStore.isLoading" class="habit-status">
        Loading habits...
      </p>

      <p v-else-if="habitStore.error" class="habit-error">
        {{ habitStore.error }}
      </p>

      <ul v-else class="habit-list">
        <li
          v-for="habit in habitStore.habits"
          :key="habit.id"
          class="habit-list-item"
          :class="{ done: isHabitDone(habit.id) }"
        >
          <span class="habit-time">
            {{ habit.createdAt.toLocaleDateString('de-DE') }}
          </span>

          <span class="habit-name">
            {{ habit.title }}
          </span>

          <button class="habit-action-btn" type="button" @click="handleEdit(habit)" title="Bearbeiten">✎</button>
          <button class="habit-action-btn" type="button" @click="habitStore.deleteHabit(habit.id)" title="Löschen">×</button>

          <input
            type="checkbox"
            class="habit-checkbox"
            :checked="isHabitDone(habit.id)"
            :aria-label="habit.title"
            @change="toggleHabitDone(habit.id)"
          />
        </li>
      </ul>
    </section>

    <!-- Kleiner Kalenderblock; Klick öffnet die CalendarView -->
    <section class="app-card">
      <h2 class="app-section-title">{{ labels.home.calendar }}</h2>

      <div class="week">
        <button
          v-for="day in weekDays"
          :key="day.id"
          type="button"
          class="week-day"
          :class="{ active: day.dayIndex === todayIndex }"
          @click="$emit('changeView', 'calendar')"
        >
          {{ day.label }}
        </button>
      </div>
    </section>

    <!-- Verwaltungsbereich für Habit-Aktionen -->
    <section class="app-card">
      <h2 class="app-section-title">{{ labels.home.habitManagement }}</h2>

      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitCreate')">
        ⊞ {{ labels.home.createHabit }}
      </button>

      <button class="app-action-button" type="button">
        ✎ {{ labels.home.editHabit }}
      </button>

      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitDelete')">
        🗑 {{ labels.home.deleteHabit }}
      </button>
    </section>

    <!-- Wiederverwendbare untere Navigation -->
    <BottomNav :current-view="currentView" @changeView="$emit('changeView', $event)" />
  </main>
</template>

<style scoped>
/* Header-Bereich des Home Screens */
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.home-profile {
  display: flex;
  align-items: center;
  gap: 14px;
}

.home-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9aa7ff, #222);
}

.home-greeting {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.home-user-name {
  margin: 0;
  color: #1f1f1f;
  font-size: 16px;
}

.home-settings-button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: #f1f1f1;
  font-size: 22px;
  cursor: pointer;
}

/* Statistikblock unter dem Header */
.home-stats {
  display: flex;
  justify-content: space-around;
  background: #e7e7e7;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}

.home-stats div {
  text-align: center;
}

.home-stats b {
  display: block;
  margin-top: 6px;
  color: #555;
}

.date {
  margin: 0;
  color: #777;
  font-size: 12px;
  font-weight: bold;
}

/* Timeline im Tagesplan */
.timeline-box {
  background: white;
  border-radius: 14px;
  padding: 12px 14px 16px;
  margin-bottom: 18px;
}

.timeline-labels {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.timeline-labels span:nth-child(1) {
  text-align: left;
}

.timeline-labels span:nth-child(2),
.timeline-labels span:nth-child(3) {
  text-align: center;
}

.timeline-labels span:nth-child(4) {
  text-align: right;
}

.timeline-main {
  height: 5px;
  background: #e7ddff;
  position: relative;
  margin-bottom: 12px;
}

.timeline-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 5px;
  background: #7437d8;
}

.timeline-events {
  height: 5px;
  background: #e3e3e3;
}

/* Liste der geladenen Habits */
.habit-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.habit-list-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  font-size: 13px;
}

.habit-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #888;
  padding: 2px 4px;
  border-radius: 4px;
}

.habit-action-btn:hover {
  background: #f1f1f1;
  color: #333;
}

.habit-time {
  font-weight: 700;
}

.habit-name {
  color: #1f1f1f;
}

/* Checkbox zum Abhaken eines Habits */
.habit-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #7437d8;
  cursor: pointer;
}

/* Visuelles Feedback für erledigte Habits */
.habit-list-item.done .habit-time,
.habit-list-item.done .habit-name {
  color: #aaaaaa;
  text-decoration: line-through;
}

.habit-status,
.habit-error {
  margin: 0;
  font-size: 13px;
}

.habit-error {
  color: #b00020;
}

/* Kleiner Wochenkalender */
.week {
  display: flex;
  justify-content: space-between;
}

.week-day {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: white;
  display: grid;
  place-items: center;
  font-size: 13px;
  color: #1f1f1f;
}

.week-day.active {
  background: #7b4dff;
  color: white;
}
</style>