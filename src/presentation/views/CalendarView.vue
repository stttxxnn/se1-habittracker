<script setup lang="ts">
import { computed, ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import CalendarGrid from '@/presentation/components/CalendarGrid.vue'
import BottomNav from '@/presentation/components/BottomNav.vue'

interface CalendarEvent {
  id: string
  title: string
  date: string
  color: string
}

defineEmits<{
  changeView: [view: string]
}>()

const selectedDate = ref<Date>(new Date())

const calendarEvents = ref<CalendarEvent[]>([
  {
    id: 'event-1',
    title: 'Morning workout',
    date: new Date().toISOString().slice(0, 10),
    color: '#5fd57d'
  },
  {
    id: 'event-2',
    title: 'Read a chapter',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10),
    color: '#2f80ed'
  },
  {
    id: 'event-3',
    title: 'Habit review',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().slice(0, 10),
    color: '#f2994a'
  }
])

const selectedDayEvents = computed(() => {
  const selectedKey = selectedDate.value.toISOString().slice(0, 10)
  return calendarEvents.value.filter((event) => event.date === selectedKey)
})

function handleDayClick(date: Date) {
  selectedDate.value = date
}
</script>

<template>
  <main class="app-screen">
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

    <section class="calendar-shortcuts">
      <button class="calendar-create-item" type="button">
        <span class="plus">+</span>
        <span>{{ labels.calendar.createItem }}</span>
      </button>
      <div class="calendar-shortcut"></div>
      <div class="calendar-shortcut"></div>
      <div class="calendar-shortcut"></div>
    </section>

    <CalendarGrid
      v-model="selectedDate"
      :events="calendarEvents"
      @dayClick="handleDayClick"
    />

    <section class="app-card calendar-events-card">
      <h2 class="app-section-title">Events on {{ selectedDate.toDateString() }}</h2>

      <div v-if="selectedDayEvents.length === 0" class="calendar-empty">
        {{ labels.calendar.noEvents }}
      </div>

      <ul v-else class="calendar-event-list">
        <li v-for="event in selectedDayEvents" :key="event.id" class="calendar-event-item">
          <span class="calendar-event-marker" :style="{ background: event.color }"></span>
          <span>{{ event.title }}</span>
        </li>
      </ul>
    </section>

    <BottomNav @changeView="$emit('changeView', $event)" />
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