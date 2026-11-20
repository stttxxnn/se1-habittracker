import { describe, it, expect } from 'vitest'
import type { Habit } from '@/domain/models/Habit'
import { isScheduledFor, weekdayOf } from '@/domain/rules/habitSchedule'

// Charakterisierungstests: halten das Verhalten fest, das bisher in HomeView (todayHabits) stand.
// Datumswerte immer mit new Date(jahr, monatIndex, tag) in lokaler Zeit bauen,
// nicht mit '2026-11-02' (würde als UTC gelesen und kann auf einen anderen Tag fallen).
const MONDAY = new Date(2026, 10, 2)    // Montag, 02.11.2026
const TUESDAY = new Date(2026, 10, 3)   // Dienstag, 03.11.2026
const SUNDAY = new Date(2026, 10, 8)    // Sonntag, 08.11.2026

function habit(overrides: Partial<Habit> = {}): Habit {
  return { id: 'h1', title: 'Test-Habit', createdAt: new Date(2026, 0, 1), ...overrides }
}

describe('weekdayOf', () => {
  it('übersetzt JS-Wochentage in Domain-Wochentage', () => {
    expect(weekdayOf(MONDAY)).toBe('monday')
    expect(weekdayOf(TUESDAY)).toBe('tuesday')
  })

  it('übersetzt Sonntag (getDay() = 0) korrekt', () => {
    expect(weekdayOf(SUNDAY)).toBe('sunday')
  })
})

describe('isScheduledFor', () => {
  it('zeigt alte Habits ohne periodicity immer an', () => {
    expect(isScheduledFor(habit(), MONDAY)).toBe(true)
  })

  it('zeigt daily-Habits an jedem Tag an', () => {
    const daily = habit({ periodicity: 'daily' })
    expect(isScheduledFor(daily, MONDAY)).toBe(true)
    expect(isScheduledFor(daily, SUNDAY)).toBe(true)
  })

  it('zeigt weekly-Habits an einem gewählten Wochentag an', () => {
    const weekly = habit({ periodicity: 'weekly', weekdays: ['monday', 'wednesday'] })
    expect(isScheduledFor(weekly, MONDAY)).toBe(true)
  })

  it('blendet weekly-Habits an nicht gewählten Wochentagen aus', () => {
    const weekly = habit({ periodicity: 'weekly', weekdays: ['monday', 'wednesday'] })
    expect(isScheduledFor(weekly, TUESDAY)).toBe(false)
  })

  it('zeigt weekly-Habits am Sonntag an, wenn sunday gewählt ist', () => {
    const weekly = habit({ periodicity: 'weekly', weekdays: ['sunday'] })
    expect(isScheduledFor(weekly, SUNDAY)).toBe(true)
  })

  it('blendet weekly-Habits ohne weekdays immer aus', () => {
    expect(isScheduledFor(habit({ periodicity: 'weekly' }), MONDAY)).toBe(false)
    expect(isScheduledFor(habit({ periodicity: 'weekly', weekdays: [] }), MONDAY)).toBe(false)
  })

  // Heutiges Verhalten, fachlich noch offen: eine echte Monatsregel kommt mit #77
  it('zeigt monthly-Habits vorerst an jedem Tag an', () => {
    const monthly = habit({ periodicity: 'monthly' })
    expect(isScheduledFor(monthly, MONDAY)).toBe(true)
    expect(isScheduledFor(monthly, TUESDAY)).toBe(true)
  })
})
