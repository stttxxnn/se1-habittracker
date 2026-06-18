<script setup lang="ts">
import { computed, ref } from 'vue'
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

// Typ für einzelne Felder im Monatskalender
type CalendarDay = {
  id: string
  dayNumber: number | null
  isToday: boolean
}

// Aktuell angezeigter Monat
const selectedDate = ref<Date>(new Date())

// Wochentage aus der zentralen Label-Datei
const calendarWeekdays = [
  labels.weekdays.sun,
  labels.weekdays.mon,
  labels.weekdays.tue,
  labels.weekdays.wed,
  labels.weekdays.thu,
  labels.weekdays.fri,
  labels.weekdays.sat
]

const currentYear = computed<number>(() => {
  return selectedDate.value.getFullYear()
})

const currentMonth = computed<number>(() => {
  return selectedDate.value.getMonth()
})

const currentMonthName = computed<string>(() => {
  return selectedDate.value.toLocaleString('en-US', { month: 'long' })
})

// Berechnet leere Felder am Monatsanfang und alle Tage des Monats
const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()

  const emptyDays: CalendarDay[] = Array.from(
    { length: firstDayOfMonth },
    (_, index) => ({
      id: `empty-${index}`,
      dayNumber: null,
      isToday: false
    })
  )

  const days: CalendarDay[] = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const dayNumber = index + 1

      const isToday =
        dayNumber === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

      return {
        id: `day-${dayNumber}`,
        dayNumber,
        isToday
      }
    }
  )

  return [...emptyDays, ...days]
})

// Einen Monat zurück wechseln
function goToPreviousMonth() {
  selectedDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

// Einen Monat nach vorne wechseln
function goToNextMonth() {
  selectedDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}
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

      <h1 class="app-page-title">{{ labels.calendar.title }}</h1>
    </header>

    <!-- Obere Shortcut-Kacheln aus dem Wireframe -->
    <section class="calendar-shortcuts">
      <button class="calendar-create-item" type="button">
        <span class="plus">+</span>
        <span>{{ labels.calendar.createItem }}</span>
      </button>

      <div class="calendar-shortcut"></div>
      <div class="calendar-shortcut"></div>
      <div class="calendar-shortcut"></div>
    </section>

    <!-- Monatskalender als grobes Layout-Skeleton -->
    <section class="app-card calendar-card">
      <div class="calendar-periods">
        <button type="button">{{ labels.calendar.day }}</button>
        <button type="button">{{ labels.calendar.week }}</button>
        <button class="active" type="button">{{ labels.calendar.month }}</button>
        <button type="button">{{ labels.calendar.year }}</button>
      </div>

      <div class="calendar-month-box">
        <div class="calendar-month-header">
          <div class="calendar-arrows">
            <button type="button" @click="goToPreviousMonth">‹</button>
            <button type="button" @click="goToNextMonth">›</button>
          </div>

          <strong class="calendar-month-name">{{ currentMonthName }}</strong>
          <strong class="calendar-year">{{ currentYear }}</strong>
        </div>

        <div class="calendar-weekdays">
          <span
            v-for="weekday in calendarWeekdays"
            :key="weekday"
          >
            {{ weekday }}
          </span>
        </div>

        <div class="calendar-days">
          <span
            v-for="day in calendarDays"
            :key="day.id"
            :class="{ active: day.isToday }"
          >
            {{ day.dayNumber }}
          </span>
        </div>
      </div>
    </section>

    <!-- Untere Navigation -->
    <BottomNav :current-view="currentView" @changeView="$emit('changeView', $event)" />
  </main>
</template>

<style scoped>
/* Shortcut-Kacheln oberhalb des Kalenders */
.calendar-shortcuts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

.calendar-create-item,
.calendar-shortcut {
  height: 72px;
  border: none;
  border-radius: 12px;
  background: #e7e7e7;
}

.calendar-create-item {
  display: grid;
  place-items: center;
  align-content: center;
  font-size: 12px;
  line-height: 1.1;
}

.plus {
  font-size: 36px;
  line-height: 1;
}

/* Spezielle Card-Struktur für den Monatskalender */
.calendar-card {
  padding: 0 0 20px;
  overflow: hidden;
}

.calendar-periods {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 12px 18px;
  background: #e7e7e7;
}

.calendar-periods button {
  border: none;
  background: transparent;
  font-size: 14px;
}

.calendar-periods .active {
  width: 32px;
  height: 32px;
  margin: 0 auto;
  border-radius: 50%;
  background: #ffffff;
}

/* Dunkler Monatsbereich wie im Wireframe */
.calendar-month-box {
  background: #181818;
  color: #ffffff;
  padding: 24px 22px;
  border-radius: 0 0 8px 8px;
}

.calendar-month-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 16px;
  margin-bottom: 24px;
  font-size: 26px;
}

.calendar-month-name {
  text-align: center;
  min-width: 0;
}

.calendar-year {
  text-align: right;
}

.calendar-arrows {
  display: flex;
  gap: 16px;
}

.calendar-arrows button {
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 34px;
  line-height: 1;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 20px;
  text-align: center;
  color: #dddddd;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 22px;
  text-align: center;
  font-size: 26px;
}

.calendar-days span {
  width: 38px;
  height: 38px;
  margin: 0 auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.calendar-days .active {
  background: #7b4dff;
  color: #ffffff;
}
</style>