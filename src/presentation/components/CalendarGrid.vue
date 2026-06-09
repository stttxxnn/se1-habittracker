<script setup lang="ts">
import { computed } from 'vue'

interface CalendarEvent {
  id: string
  title: string
  date: string
  color: string
}

type CalendarDay = {
  id: string
  dayNumber: number | null
  date: Date | null
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
}

const props = defineProps<{
  modelValue: Date
  events: CalendarEvent[]
}>

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date): void
  (e: 'dayClick', date: Date): void
}>()

const calendarWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentYear = computed(() => props.modelValue.getFullYear())
const currentMonth = computed(() => props.modelValue.getMonth())
const currentMonthName = computed(() =>
  props.modelValue.toLocaleString('en-US', { month: 'long' })
)

const currentMonthEvents = computed(() =>
  props.events.filter((event) => {
    const date = new Date(event.date)
    return (
      date.getFullYear() === currentYear.value &&
      date.getMonth() === currentMonth.value
    )
  })
)

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const eventMap = new Map<string, CalendarEvent[]>()
  currentMonthEvents.value.forEach((event) => {
    const dateKey = new Date(event.date).getDate()
    const key = `${year}-${month}-${dateKey}`
    const current = eventMap.get(key) ?? []
    eventMap.set(key, [...current, event])
  })

  const emptyDays: CalendarDay[] = Array.from({ length: firstDayOfMonth }, (_, index) => ({
    id: `empty-${index}`,
    dayNumber: null,
    date: null,
    isToday: false,
    isSelected: false,
    events: []
  }))

  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1
    const date = new Date(year, month, dayNumber)
    const key = `${year}-${month}-${dayNumber}`
    const events = eventMap.get(key) ?? []
    const isToday =
      dayNumber === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    const isSelected =
      dayNumber === props.modelValue.getDate() &&
      month === props.modelValue.getMonth() &&
      year === props.modelValue.getFullYear()

    return {
      id: `day-${dayNumber}`,
      dayNumber,
      date,
      isToday,
      isSelected,
      events
    }
  })

  return [...emptyDays, ...days]
})

function goToPreviousMonth() {
  const year = currentYear.value
  const month = currentMonth.value - 1
  emit('update:modelValue', new Date(year, month, 1))
}

function goToNextMonth() {
  const year = currentYear.value
  const month = currentMonth.value + 1
  emit('update:modelValue', new Date(year, month, 1))
}

function selectDay(day: CalendarDay) {
  if (!day.date) return
  emit('update:modelValue', day.date)
  emit('dayClick', day.date)
}
</script>

<template>
  <section class="calendar-grid-card app-card">
    <div class="calendar-grid-header">
      <div class="calendar-grid-controls">
        <button type="button" @click="goToPreviousMonth">‹</button>
        <div>
          <strong>{{ currentMonthName }}</strong>
          <span>{{ currentYear }}</span>
        </div>
        <button type="button" @click="goToNextMonth">›</button>
      </div>

      <div class="calendar-grid-weekdays">
        <span v-for="weekday in calendarWeekdays" :key="weekday">{{ weekday }}</span>
      </div>

      <div class="calendar-grid-days">
        <button
          v-for="day in calendarDays"
          :key="day.id"
          :class="[
            'calendar-grid-day',
            { empty: !day.dayNumber, today: day.isToday, selected: day.isSelected, 'has-events': day.events.length > 0 }
          ]"
          type="button"
          @click="selectDay(day)"
          :disabled="!day.date"
        >
          <div class="calendar-grid-day-number">{{ day.dayNumber }}</div>
          <div class="calendar-grid-event-marker" v-if="day.events.length > 0">
            <span v-for="event in day.events.slice(0, 2)" :key="event.id" :style="{ background: event.color }"></span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar-grid-card {
  padding: 16px;
}

.calendar-grid-header {
  display: grid;
  gap: 12px;
}

.calendar-grid-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.calendar-grid-controls button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  color: #1f1f1f;
  font-size: 20px;
}

.calendar-grid-controls strong,
.calendar-grid-controls span {
  display: block;
  text-align: center;
}

.calendar-grid-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  text-align: center;
  color: #777;
  font-size: 12px;
}

.calendar-grid-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-grid-day {
  min-height: 70px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: #ffffff;
  color: #1f1f1f;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
}

.calendar-grid-day.empty {
  background: transparent;
  border-color: transparent;
}

.calendar-grid-day.today {
  border-color: #5fd57d;
}

.calendar-grid-day.selected {
  background: #5fd57d;
  color: #ffffff;
}

.calendar-grid-day.has-events {
  box-shadow: inset 0 0 0 1px rgba(95, 213, 125, 0.2);
}

.calendar-grid-day-number {
  font-weight: 700;
}

.calendar-grid-event-marker {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.calendar-grid-event-marker span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
