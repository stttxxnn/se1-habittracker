import { describe, it, expect } from 'vitest'
import { addDays, parseIsoDate, toIsoDate } from '@/domain/rules/calendarDay'

describe('toIsoDate', () => {
  it('formatiert in lokaler Zeit als YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })

  it('bleibt kurz nach Mitternacht beim selben Tag (anders als toISOString)', () => {
    expect(toIsoDate(new Date(2026, 10, 20, 0, 30))).toBe('2026-11-20')
  })
})

describe('parseIsoDate / addDays', () => {
  it('liest einen Kalendertag als lokales Datum', () => {
    const d = parseIsoDate('2026-11-03')
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 3])
  })

  it('geht über Monatsgrenzen', () => {
    expect(toIsoDate(addDays(parseIsoDate('2026-10-31'), 1))).toBe('2026-11-01')
  })
})
