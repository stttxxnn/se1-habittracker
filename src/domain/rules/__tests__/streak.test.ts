import { describe, it, expect } from 'vitest'
import type { Habit } from '@/domain/models/Habit'
import { calculateStreak } from '@/domain/rules/streak'

// Heute ist Dienstag, 03.11.2026 (lokale Zeit, wie in habitSchedule.test.ts)
const TODAY = new Date(2026, 10, 3, 18, 30)

function habit(overrides: Partial<Habit> = {}): Habit {
  return { id: 'h1', title: 'Test-Habit', createdAt: new Date(2026, 0, 1), periodicity: 'daily', ...overrides }
}

describe('calculateStreak', () => {
  it('ohne Haken ist die Streak 0', () => {
    expect(calculateStreak(habit(), [], TODAY)).toEqual({ current: 0, best: 0 })
  })

  it('R2: zählt eingeplante Tage in Folge mit Haken', () => {
    const dates = ['2026-11-01', '2026-11-02', '2026-11-03']
    expect(calculateStreak(habit(), dates, TODAY)).toEqual({ current: 3, best: 3 })
  })

  it('R1: mehrere Haken am selben Tag zählen einmal', () => {
    expect(calculateStreak(habit(), ['2026-11-03', '2026-11-03'], TODAY).current).toBe(1)
  })

  it('R3: ein verpasster eingeplanter Tag setzt die Streak zurück', () => {
    const dates = ['2026-10-30', '2026-10-31', '2026-11-02', '2026-11-03'] // 01.11. verpasst
    expect(calculateStreak(habit(), dates, TODAY)).toEqual({ current: 2, best: 2 })
  })

  it('R5: heute noch nicht abgehakt bricht die Streak nicht', () => {
    expect(calculateStreak(habit(), ['2026-11-01', '2026-11-02'], TODAY).current).toBe(2)
  })

  it('R5: gestern verpasst bricht die Streak', () => {
    expect(calculateStreak(habit(), ['2026-10-31', '2026-11-01'], TODAY).current).toBe(0)
  })

  it('R4: nicht eingeplante Tage unterbrechen eine weekly-Streak nicht', () => {
    const weekly = habit({ periodicity: 'weekly', weekdays: ['monday', 'thursday'] })
    const dates = ['2026-10-26', '2026-10-29', '2026-11-02'] // Mo, Do, Mo
    expect(calculateStreak(weekly, dates, TODAY).current).toBe(3)
  })

  it('R6: der Rekord bleibt erhalten, wenn die aktuelle Streak abreißt', () => {
    const dates = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-11-03']
    expect(calculateStreak(habit(), dates, TODAY)).toEqual({ current: 1, best: 4 })
  })

  it('ignoriert Haken in der Zukunft', () => {
    expect(calculateStreak(habit(), ['2026-11-04'], TODAY)).toEqual({ current: 0, best: 0 })
  })

  it('zählt über die Zeitumstellung (25.10.2026) hinweg korrekt', () => {
    const dates = ['2026-10-24', '2026-10-25', '2026-10-26']
    expect(calculateStreak(habit(), dates, new Date(2026, 9, 26, 12)).current).toBe(3)
  })
})
