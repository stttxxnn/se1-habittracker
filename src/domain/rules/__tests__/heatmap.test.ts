import { describe, it, expect } from 'vitest'
import type { Habit } from '@/domain/models/Habit'
import { buildHeatmap, levelFor } from '@/domain/rules/heatmap'

// Datumswerte immer mit new Date(jahr, monatIndex, tag) in lokaler Zeit bauen,
// nicht mit '2026-11-02' (würde als UTC gelesen und kann auf einen anderen Tag fallen).
const MONDAY = new Date(2026, 10, 2) // Montag, 02.11.2026
const TUESDAY = new Date(2026, 10, 3) // Dienstag, 03.11.2026

function habit(overrides: Partial<Habit> = {}): Habit {
  return { id: 'h1', title: 'Test-Habit', createdAt: new Date(2026, 0, 1), ...overrides }
}

describe('levelFor', () => {
  it('ist Stufe 0, wenn nichts eingeplant war', () => {
    expect(levelFor(0, 0)).toBe(0)
  })

  it('ist Stufe 0, wenn eingeplant war, aber nichts erledigt wurde', () => {
    expect(levelFor(0, 4)).toBe(0)
  })

  it('ist Stufe 1 bei einem Anteil unter 0.5', () => {
    expect(levelFor(1, 4)).toBe(1) // 0.25
  })

  it('ist Stufe 2 genau an der Grenze von 0.5', () => {
    expect(levelFor(2, 4)).toBe(2) // 0.5
  })

  it('ist Stufe 1 knapp unter der Grenze von 0.5', () => {
    expect(levelFor(1, 3)).toBe(1) // ~0.33
  })

  it('ist Stufe 3 genau an der Grenze von 0.75', () => {
    expect(levelFor(3, 4)).toBe(3)
  })

  it('ist Stufe 2 knapp unter der Grenze von 0.75', () => {
    expect(levelFor(2, 3)).toBe(2) // ~0.67
  })

  it('ist Stufe 4 bei vollständig erledigt (Anteil 1)', () => {
    expect(levelFor(4, 4)).toBe(4)
    expect(levelFor(1, 1)).toBe(4)
  })

  it('behandelt scheduled 0 als Stufe 0, auch bei completed > 0 (Datenfehler-Fall)', () => {
    expect(levelFor(2, 0)).toBe(0)
  })
})

describe('buildHeatmap', () => {
  it('berechnet pro Tag scheduled, completed und level', () => {
    const daily = habit({ id: 'daily-habit', periodicity: 'daily' })
    const weekly = habit({ id: 'weekly-habit', periodicity: 'weekly', weekdays: ['monday'] })

    // Montag: beide Habits eingeplant, nur daily-habit erledigt
    // Dienstag: nur daily-habit eingeplant, nichts erledigt
    const completedCountByDate = new Map<string, number>([['2026-11-02', 1]])

    const result = buildHeatmap([daily, weekly], completedCountByDate, [MONDAY, TUESDAY])

    expect(result).toEqual([
      { date: '2026-11-02', completed: 1, scheduled: 2, level: 2 }, // Anteil 0.5
      { date: '2026-11-03', completed: 0, scheduled: 1, level: 0 },
    ])
  })

  it('liefert ein leeres Array für einen leeren Zeitraum', () => {
    expect(buildHeatmap([habit()], new Map(), [])).toEqual([])
  })
})
