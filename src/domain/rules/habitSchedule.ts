import type { Habit, Weekday } from '@/domain/models/Habit'

// Fachliche Regel: An welchem Tag ist ein Habit eingeplant?
// Reine Funktionen ohne Vue, Store oder Datenbank, dadurch mit festen Daten testbar.

// JS getDay(): 0 = Sonntag, 1 = Montag, ..., 6 = Samstag
const JS_DAY_TO_WEEKDAY: Record<number, Weekday> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

// Wochentag eines Datums als Domain-Typ (lokale Zeit)
export function weekdayOf(date: Date): Weekday {
  return JS_DAY_TO_WEEKDAY[date.getDay()]
}

// Ist das Habit an diesem Datum eingeplant?
export function isScheduledFor(habit: Habit, date: Date): boolean {
  const p = habit.periodicity

  // Kein periodicity-Feld (alte Habits ohne Migration): immer anzeigen
  if (!p) return true

  if (p === 'daily') return true

  if (p === 'weekly') {
    // Nur an den gespeicherten Wochentagen
    return (habit.weekdays ?? []).includes(weekdayOf(date))
  }

  // monthly: vorerst immer anzeigen (genaues Datum-Matching kommt mit #77)
  return true
}
