<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'
import BottomNav from '@/presentation/components/BottomNav.vue'

defineProps<{ currentView: string }>()
const emit = defineEmits<{ changeView: [view: string] }>()

type WeekDay = { id: number; label: string; dayIndex: number }
type User = { id: number; name: string }
type HomeStats = { streakDays: number; habitsCount: number; vicesCount: number }

const habitStore = useHabitStore()
// completedHabitIds and hiddenHabitIds live in the store so they survive navigation
const completedHabitIds = habitStore.completedHabitIds
const hiddenHabitIds = habitStore.hiddenHabitIds
const removalTimers = new Map<string, number>()
const REMOVAL_DELAY_MS = 2500

// ─── Timeline-Hilfsfunktionen ──────────────────────────────────────────────

function normalizeTime(time: string): string { return time.slice(0, 5) }

function timeToMinutes(time: string): number {
  const [h, m] = normalizeTime(time).split(':').map(Number)
  return h * 60 + m
}

function minutesToPercent(minutes: number): number {
  return (minutes / 1440) * 100
}

function parseDuration(raw: number | string | undefined | null): number {
  if (raw === undefined || raw === null) return 0
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && raw.includes(':')) {
    const parts = raw.split(':').map(Number)
    return parts[0] * 60 + (parts[1] ?? 0)
  }
  const n = Number(raw)
  return isNaN(n) ? 0 : n
}

const MIN_BLOCK_WIDTH_PERCENT = 2

function formatTimeRange(time: string, duration: number | string): string {
  const dur = parseDuration(duration)
  const startMin = timeToMinutes(time)
  const endMin = startMin + dur
  const endH = Math.floor(endMin / 60) % 24
  const endM = endMin % 60
  return `${normalizeTime(time)} – ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

const timelineLabels = [
  { text: '00:00', percent: 0 },
  { text: '08:00', percent: (8 / 24) * 100 },
  { text: '16:00', percent: (16 / 24) * 100 },
  { text: '24:00', percent: 100 },
]

// ─── Wochentag-Mapping (JS getDay() → Habit-Weekday-String) ──────────────────
// JS: 0=Sonntag, 1=Mo, ..., 6=Sa
const JS_DAY_TO_WEEKDAY: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
}

// ─── Wochenleiste ─────────────────────────────────────────────────────────
const now = ref<Date>(new Date())
const selectedDayIndex = ref<number>(now.value.getDay())

function selectDay(dayIndex: number) {
  selectedDayIndex.value = dayIndex
  // CalendarView is not yet implemented — selection only highlights the chosen day
}

// ─── Habit-Filter: nur Habits für den heutigen Wochentag ────────────────────
const todayWeekday = computed<string>(() => JS_DAY_TO_WEEKDAY[now.value.getDay()])

const todayHabits = computed(() =>
  habitStore.habits.filter(habit => {
    const p = habit.periodicity

    // Kein periodicity-Feld (alte Habits ohne Migration): immer anzeigen
    if (!p) return true

    if (p === 'daily') return true

    if (p === 'weekly') {
      // Nur anzeigen wenn heute in den gespeicherten Wochentagen ist
      return (habit.weekdays ?? []).includes(todayWeekday.value)
    }

    // monthly: immer anzeigen (genaues Datum-Matching wäre ein eigenes Feature)
    return true
  })
)

const visibleHabits = computed(() =>
  todayHabits.value.filter(h => !hiddenHabitIds.value.has(h.id))
)

// ─── Timeline-Blöcke ──────────────────────────────────────────────────────
const timelineBlocks = computed(() =>
  visibleHabits.value
    .filter(h => h.scheduledTime && h.duration != null)
    .map(h => {
      const dur = parseDuration(h.duration)
      const startMin = timeToMinutes(h.scheduledTime!)
      const leftPct = minutesToPercent(startMin)
      const widthPct = Math.max(minutesToPercent(dur), MIN_BLOCK_WIDTH_PERCENT)
      return {
        id: h.id,
        label: h.title,
        color: h.color ?? '#7437d8',
        left: Math.min(leftPct, 100 - MIN_BLOCK_WIDTH_PERCENT),
        width: widthPct
      }
    })
)

// ─── Checkbox & Completion ────────────────────────────────────────────────
function isHabitDone(id: string) { return completedHabitIds.value.has(id) }

function toggleHabitDone(id: string) {
  const updated = new Set(completedHabitIds.value)
  if (updated.has(id)) {
    updated.delete(id)
    const t = removalTimers.get(id)
    if (t !== undefined) { clearTimeout(t); removalTimers.delete(id) }
  } else {
    updated.add(id)
    const t = window.setTimeout(() => {
      hiddenHabitIds.value = new Set(hiddenHabitIds.value).add(id)
      removalTimers.delete(id)
    }, REMOVAL_DELAY_MS)
    removalTimers.set(id, t)
  }
  completedHabitIds.value = updated
}

// ─── Sonstiges ────────────────────────────────────────────────────────────
const homeStats = ref<HomeStats>({ streakDays: 0, habitsCount: 0, vicesCount: 0 })
const user = ref<User>({ id: 1, name: 'Laura M.' })

const currentGreeting = computed<string>(() => {
  const h = now.value.getHours()
  if (h >= 5  && h < 12) return labels.home.morningGreeting
  if (h >= 12 && h < 18) return labels.home.afternoonGreeting
  if (h >= 18 && h < 22) return labels.home.eveningGreeting
  return labels.home.nightGreeting
})

const currentDate = computed<string>(() => now.value.toLocaleDateString('de-DE'))

const currentDayProgress = computed<number>(() => {
  const h = now.value.getHours()
  const m = now.value.getMinutes()
  const s = now.value.getSeconds()
  return ((h * 60 + m + s / 60) / 1440) * 100
})

const todayIndex = computed<number>(() => now.value.getDay())

const weekDays: WeekDay[] = [
  { id: 1, label: labels.weekdays.mon, dayIndex: 1 },
  { id: 2, label: labels.weekdays.tue, dayIndex: 2 },
  { id: 3, label: labels.weekdays.wed, dayIndex: 3 },
  { id: 4, label: labels.weekdays.thu, dayIndex: 4 },
  { id: 5, label: labels.weekdays.fri, dayIndex: 5 },
  { id: 6, label: labels.weekdays.sat, dayIndex: 6 },
  { id: 7, label: labels.weekdays.sun, dayIndex: 0 },
]

let clockTimer: number | undefined

onMounted(async () => {
  // Only load from backend if no habits are cached yet — preserves completedHabitIds
  // across navigation (e.g. after creating a new habit and returning to HomeView)
  if (habitStore.habits.length === 0) {
    await habitStore.loadAllHabits()
  }
  homeStats.value = { streakDays: 0, habitsCount: habitStore.habits.length, vicesCount: 0 }
  clockTimer = window.setInterval(() => { now.value = new Date() }, 60_000)
})

function handleEdit(habit: import('@/domain/models/Habit').Habit) {
  habitStore.setHabitToEdit(habit)
  emit('changeView', 'habitEdit')
}

function handleOpenEditSelection() {
  habitStore.clearHabitToEdit()
  emit('changeView', 'habitEdit')
}

// Beim Verlassen der View: Timer aufräumen
onUnmounted(() => {
  if (clockTimer !== undefined) clearInterval(clockTimer)
  for (const t of removalTimers.values()) clearTimeout(t)
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
          <span
            v-for="lbl in timelineLabels"
            :key="lbl.text"
            class="timeline-label"
            :style="{ left: lbl.percent + '%' }"
          >{{ lbl.text }}</span>
        </div>
        <div class="timeline-main">
          <div class="timeline-progress" :style="{ width: currentDayProgress + '%' }"></div>
        </div>
        <div class="timeline-events">
          <div
            v-for="block in timelineBlocks"
            :key="block.id"
            class="timeline-habit-block"
            :style="{ left: block.left + '%', width: block.width + '%', backgroundColor: block.color }"
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
          <span class="habit-color-dot" :style="{ backgroundColor: habit.color ?? '#7437d8' }"></span>
          <span class="habit-time">
            {{ (habit.scheduledTime && habit.duration != null)
                ? formatTimeRange(habit.scheduledTime, habit.duration)
                : (habit.scheduledTime ? normalizeTime(habit.scheduledTime) : '–') }}
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
<<<<<<< HEAD
      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitCreate')">⊞ {{ labels.home.createHabit }}</button>
      <button class="app-action-button" type="button" @click="handleOpenEditSelection">✎ {{ labels.home.editHabit }}</button>
      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitDelete')">🗑 {{ labels.home.deleteHabit }}</button>
=======

      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitCreate')">
        ⊞ {{ labels.home.createHabit }}
      </button>

      <button class="app-action-button" type="button" @click="handleOpenEditSelection">
        ✎ {{ labels.home.editHabit }}
      </button>

      <button class="app-action-button" type="button" @click="$emit('changeView', 'habitDelete')">
        🗑 {{ labels.home.deleteHabit }}
      </button>
>>>>>>> origin/main
    </section>

    <BottomNav :current-view="currentView" @changeView="$emit('changeView', $event)" />
  </main>
</template>

<style scoped>
<<<<<<< HEAD
.home-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; }
.home-profile { display:flex; align-items:center; gap:14px; }
.home-avatar { width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#9aa7ff,#222); }
.home-greeting { margin:0; font-size:22px; font-weight:700; }
.home-user-name { margin:0; color:#1f1f1f; font-size:16px; }
.home-settings-button { width:48px; height:48px; border:none; border-radius:50%; background:#f1f1f1; font-size:22px; cursor:pointer; }
.home-stats { display:flex; justify-content:space-around; background:#e7e7e7; border-radius:12px; padding:14px; margin-bottom:20px; }
.home-stats div { text-align:center; }
.home-stats b { display:block; margin-top:6px; color:#555; }
.date { margin:0; color:#777; font-size:12px; font-weight:bold; }
.timeline-box { background:white; border-radius:14px; padding:12px 14px 16px; margin-bottom:18px; }
.timeline-labels { position:relative; height:18px; margin-bottom:4px; }
.timeline-label { position:absolute; transform:translateX(-50%); font-size:11px; font-weight:700; color:#666; white-space:nowrap; }
.timeline-label:first-child { transform:translateX(0); }
.timeline-label:last-child  { transform:translateX(-100%); }
.timeline-main { height:5px; background:#e7ddff; position:relative; margin-bottom:8px; border-radius:3px; }
.timeline-progress { position:absolute; left:0; top:0; height:5px; background:#7437d8; border-radius:3px; }
.timeline-events { position:relative; height:10px; background:#ebebeb; border-radius:5px; overflow:hidden; }
.timeline-habit-block { position:absolute; top:0; height:100%; border-radius:3px; opacity:0.85; min-width:4px; }
.habit-list { list-style:none; margin:0; padding:0; }
.habit-list-item { display:grid; grid-template-columns:10px 1fr auto auto auto auto; gap:8px; align-items:center; padding:10px 0; border-bottom:1px solid #f0f0f0; }
.habit-list-item:last-child { border-bottom:none; }
.habit-color-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.habit-time { font-weight:700; font-size:13px; white-space:nowrap; color:#5a3ec8; letter-spacing:0.02em; }
.habit-name { color:#1f1f1f; font-size:14px; }
.habit-action-btn { background:none; border:none; cursor:pointer; font-size:16px; color:#888; padding:2px 4px; border-radius:4px; }
.habit-action-btn:hover { background:#f1f1f1; color:#333; }
.habit-checkbox { width:20px; height:20px; accent-color:#7437d8; cursor:pointer; }
.habit-list-item .habit-time, .habit-list-item .habit-name { transition:color 0.3s ease; }
.habit-list-item.done .habit-time, .habit-list-item.done .habit-name { color:#aaaaaa; text-decoration:line-through; }
.habit-fade-leave-active { transition:opacity 0.4s ease, transform 0.4s ease; }
.habit-fade-leave-to { opacity:0; transform:translateX(24px); }
.habit-fade-move { transition:transform 0.4s ease; }
.habit-status, .habit-error { margin:0; font-size:13px; }
.habit-error { color:#b00020; }
.week { display:flex; justify-content:space-between; }
.week-day { width:38px; height:38px; border:none; border-radius:50%; background:white; display:grid; place-items:center; font-size:13px; color:#1f1f1f; cursor:pointer; transition:background 0.2s ease, color 0.2s ease; }
.week-day:hover { background:#ede8ff; color:#7437d8; }
.week-day.active { background:#7b4dff; color:white; }
.week-day.today:not(.active) { outline:2px solid #7437d8; outline-offset:-2px; }
=======
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

/* Visuelles Feedback für erledigte Habits (weicher Übergang zu grau/durchgestrichen) */
.habit-list-item .habit-time,
.habit-list-item .habit-name {
  transition: color 0.3s ease;
}

.habit-list-item.done .habit-time,
.habit-list-item.done .habit-name {
  color: #aaaaaa;
  text-decoration: line-through;
}

/* Sanftes Ausblenden, wenn ein abgehakter Habit aus dem Tagesplan verschwindet */
.habit-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.habit-fade-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

/* Nachrückende Habits gleiten weich an ihre neue Position */
.habit-fade-move {
  transition: transform 0.4s ease;
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
>>>>>>> origin/main
</style>
