<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'
import BottomNav from '@/presentation/components/BottomNav.vue'

defineProps<{
  currentView: string
}>()

const emit = defineEmits<{
  changeView: [view: string]
}>()

type WeekDay = {
  id: number
  label: string
  dayIndex: number
}

type User = {
  id: number
  name: string
}

type HomeStats = {
  streakDays: number
  habitsCount: number
  vicesCount: number
}

const habitStore = useHabitStore()

const completedHabitIds = ref<Set<string>>(new Set())
const hiddenHabitIds = ref<Set<string>>(new Set())
const removalTimers = new Map<string, number>()
const REMOVAL_DELAY_MS = 2500

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToPercent(minutes: number): number {
  return (minutes / 1440) * 100
}

// ─── Ausgewählter Tag in der Wochenleiste ─────────────────────────────────────
const now = ref<Date>(new Date())
const selectedDayIndex = ref<number>(now.value.getDay())

function selectDay(dayIndex: number) {
  selectedDayIndex.value = dayIndex
  // Klick auf Wochentag → Kalender öffnen
  emit('changeView', 'calendar')
}

// ─── Filter: nur Habits anzeigen ──────────────────────────────────────────────
// Habits ohne scheduledDate werden IMMER angezeigt (Abwärtskompatibilität).
// Habits mit scheduledDate werden nur am passenden Tag angezeigt.
const todayString = computed<string>(() => {
  const d = now.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const todayHabits = computed(() => {
  return habitStore.habits.filter(habit => {
    if (!habit.createdAt) return true
    const habitDate = habit.createdAt instanceof Date
      ? habit.createdAt.toISOString().slice(0, 10)
      : String(habit.createdAt).slice(0, 10)
    return habitDate === todayString.value
  })
})

const visibleHabits = computed(() => {
  return todayHabits.value.filter(habit => !hiddenHabitIds.value.has(habit.id))
})

// ─── Timeline-Blöcke: farbig nach habit.color ────────────────────────────────
const timelineBlocks = computed(() => {
  return visibleHabits.value
    .filter(h => h.scheduledTime && h.duration)
    .map(h => {
      const startMin = timeToMinutes(h.scheduledTime!)
      const endMin = startMin + h.duration!
      return {
        id: h.id,
        label: h.title,
        color: h.color ?? '#7437d8',
        left: minutesToPercent(startMin),
        width: minutesToPercent(h.duration!)
      }
    })
})

// ─── Formatierungsfunktionen ──────────────────────────────────────────────────

function formatTimeRange(time: string, duration: number): string {
  const startMin = timeToMinutes(time)
  const endMin = startMin + duration
  const endH = Math.floor(endMin / 60) % 24
  const endM = endMin % 60
  return `${time} – ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

function isHabitDone(id: string): boolean {
  return completedHabitIds.value.has(id)
}

function toggleHabitDone(id: string) {
  const updated = new Set(completedHabitIds.value)

  if (updated.has(id)) {
    updated.delete(id)
    const timer = removalTimers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      removalTimers.delete(id)
    }
  } else {
    updated.add(id)
    const timer = window.setTimeout(() => {
      hiddenHabitIds.value = new Set(hiddenHabitIds.value).add(id)
      removalTimers.delete(id)
    }, REMOVAL_DELAY_MS)
    removalTimers.set(id, timer)
  }

  completedHabitIds.value = updated
}

const homeStats = ref<HomeStats>({
  streakDays: 0,
  habitsCount: 0,
  vicesCount: 0
})

const user = ref<User>({
  id: 1,
  name: 'Laura M.'
})

const currentGreeting = computed<string>(() => {
  const hour = now.value.getHours()
  if (hour >= 5 && hour < 12) return labels.home.morningGreeting
  if (hour >= 12 && hour < 18) return labels.home.afternoonGreeting
  if (hour >= 18 && hour < 22) return labels.home.eveningGreeting
  return labels.home.nightGreeting
})

const currentDate = computed<string>(() => {
  return now.value.toLocaleDateString('de-DE')
})

const currentDayProgress = computed<number>(() => {
  const hours = now.value.getHours()
  const minutes = now.value.getMinutes()
  const seconds = now.value.getSeconds()
  const passedMinutes = hours * 60 + minutes + seconds / 60
  return (passedMinutes / 1440) * 100
})

const todayIndex = computed<number>(() => {
  return now.value.getDay()
})

const timelineLabels: string[] = ['00:00', '08:00', '16:00', '00:00']

const weekDays: WeekDay[] = [
  { id: 1, label: labels.weekdays.mon, dayIndex: 1 },
  { id: 2, label: labels.weekdays.tue, dayIndex: 2 },
  { id: 3, label: labels.weekdays.wed, dayIndex: 3 },
  { id: 4, label: labels.weekdays.thu, dayIndex: 4 },
  { id: 5, label: labels.weekdays.fri, dayIndex: 5 },
  { id: 6, label: labels.weekdays.sat, dayIndex: 6 },
  { id: 7, label: labels.weekdays.sun, dayIndex: 0 }
]

let clockTimer: number | undefined

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

function handleEdit(habit: import('@/domain/models/Habit').Habit) {
  habitStore.setHabitToEdit(habit)
  emit('changeView', 'habitEdit')
}

onUnmounted(() => {
  if (clockTimer !== undefined) clearInterval(clockTimer)
  for (const timer of removalTimers.values()) clearTimeout(timer)
  removalTimers.clear()
})
</script>

<template>
  <main class="app-screen">
    <header class="home-header">
      <div class="home-profile">
        <div class="home-avatar"></div>
        <div>
          <h1 class="home-greeting">{{ currentGreeting }}</h1>
          <p class="home-user-name">{{ user.name }}</p>
        </div>
      </div>
      <button class="home-settings-button" type="button" @click="$emit('changeView', 'settings')">⚙</button>
    </header>

    <section class="home-stats">
      <div><span>🔥</span><b>{{ homeStats.streakDays }} {{ labels.home.streak }}</b></div>
      <div><span>🎯</span><b>{{ homeStats.habitsCount }} {{ labels.home.habits }}</b></div>
      <div><span>🚬</span><b>{{ homeStats.vicesCount }} {{ labels.home.vices }}</b></div>
    </section>

    <section class="app-card">
      <p class="date">{{ currentDate }}</p>
      <h2 class="app-section-title">{{ labels.home.todayPlan }}</h2>

      <div class="timeline-box">
        <div class="timeline-labels">
          <span v-for="(time, index) in timelineLabels" :key="index">{{ time }}</span>
        </div>

        <div class="timeline-main">
          <div class="timeline-progress" :style="{ width: currentDayProgress + '%' }"></div>
        </div>

        <div class="timeline-events">
          <div
            v-for="block in timelineBlocks"
            :key="block.id"
            class="timeline-habit-block"
            :style="{
              left: block.left + '%',
              width: block.width + '%',
              backgroundColor: block.color
            }"
            :title="block.label"
          ></div>
        </div>
      </div>

      <p v-if="habitStore.isLoading" class="habit-status">Loading habits...</p>
      <p v-else-if="habitStore.error" class="habit-error">{{ habitStore.error }}</p>

      <TransitionGroup v-else tag="ul" name="habit-fade" class="habit-list">
        <li
          v-for="habit in visibleHabits"
          :key="habit.id"
          class="habit-list-item"
          :class="{ done: isHabitDone(habit.id) }"
        >
          <span
            class="habit-color-dot"
            :style="{ backgroundColor: habit.color ?? '#7437d8' }"
          ></span>

          <span class="habit-time">
            {{ (habit.scheduledTime && habit.duration)
              ? formatTimeRange(habit.scheduledTime, habit.duration)
              : (habit.scheduledTime ?? '–') }}
          </span>

          <span class="habit-name">{{ habit.title }}</span>

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
      </TransitionGroup>
    </section>

    <!-- Wochenkalender: Klick auf Tag öffnet CalendarView -->
    <section class="app-card">
      <h2 class="app-section-title">{{ labels.home.calendar }}</h2>
      <div class="week">
        <button
          v-for="day in weekDays"
          :key="day.id"
          class="week-day"
          :class="{ active: day.dayIndex === selectedDayIndex, today: day.dayIndex === todayIndex }"
          type="button"
          :aria-label="day.label"
          @click="selectDay(day.dayIndex)"
        >
          {{ day.label }}
        </button>
      </div>
    </section>

    <section class="app-card">
      <h2 class="app-section-title">{{ labels.home.habitManagement }}</h2>
      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitCreate')">⊞ {{ labels.home.createHabit }}</button>
      <button class="app-action-button" type="button">✎ {{ labels.home.editHabit }}</button>
      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitDelete')">🗑 {{ labels.home.deleteHabit }}</button>
    </section>

    <BottomNav :current-view="currentView" @changeView="$emit('changeView', $event)" />
  </main>
</template>

<style scoped>
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

.home-stats {
  display: flex;
  justify-content: space-around;
  background: #e7e7e7;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}

.home-stats div { text-align: center; }

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

.timeline-labels span:nth-child(1) { text-align: left; }
.timeline-labels span:nth-child(2),
.timeline-labels span:nth-child(3) { text-align: center; }
.timeline-labels span:nth-child(4) { text-align: right; }

.timeline-main {
  height: 5px;
  background: #e7ddff;
  position: relative;
  margin-bottom: 8px;
  border-radius: 3px;
}

.timeline-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 5px;
  background: #7437d8;
  border-radius: 3px;
}

.timeline-events {
  position: relative;
  height: 10px;
  background: #ebebeb;
  border-radius: 5px;
  overflow: hidden;
}

.timeline-habit-block {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 3px;
  opacity: 0.85;
  min-width: 4px;
}

.habit-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.habit-list-item {
  display: grid;
  grid-template-columns: 10px 90px 1fr auto auto auto;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  font-size: 13px;
}

.habit-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.habit-time {
  font-weight: 700;
  font-size: 12px;
  white-space: nowrap;
}

.habit-name {
  color: #1f1f1f;
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

.habit-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #7437d8;
  cursor: pointer;
}

.habit-list-item .habit-time,
.habit-list-item .habit-name {
  transition: color 0.3s ease;
}

.habit-list-item.done .habit-time,
.habit-list-item.done .habit-name {
  color: #aaaaaa;
  text-decoration: line-through;
}

.habit-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.habit-fade-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.habit-fade-move {
  transition: transform 0.4s ease;
}

.habit-status,
.habit-error {
  margin: 0;
  font-size: 13px;
}

.habit-error { color: #b00020; }

.week {
  display: flex;
  justify-content: space-between;
}

/* week-day ist jetzt ein <button> → Cursor + Reset */
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
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.week-day:hover {
  background: #ede8ff;
  color: #7437d8;
}

/* Heute-Marker: lila Hintergrund */
.week-day.active {
  background: #7b4dff;
  color: white;
}

/* Ausgewählter Tag (nach Klick) wenn nicht heute: dunklerer Rand */
.week-day.today:not(.active) {
  outline: 2px solid #7437d8;
  outline-offset: -2px;
}
</style>
