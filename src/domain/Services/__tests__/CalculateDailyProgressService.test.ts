import { describe, it, expect } from 'vitest'
import { CalculateDailyProgressService } from '../CalculateDailyProgressService'

describe('CalculateDailyProgressService', () => {
  const service = new CalculateDailyProgressService()

  it('gibt 0 zurück wenn keine Habits vorhanden sind', () => {
    expect(service.execute([], [])).toBe(0)
  })

  it('gibt 0 zurück wenn keine Habits erledigt wurden', () => {
    expect(service.execute(['a', 'b', 'c'], [])).toBe(0)
  })

  it('gibt 100 zurück wenn alle Habits erledigt sind', () => {
    expect(service.execute(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(100)
  })

  it('berechnet 50% korrekt', () => {
    expect(service.execute(['a', 'b'], ['a'])).toBe(50)
  })

  it('rundet auf ganze Zahlen ab (1 von 3 = 33)', () => {
    expect(service.execute(['a', 'b', 'c'], ['a'])).toBe(33)
  })

  it('rundet auf ganze Zahlen auf (2 von 3 = 67)', () => {
    expect(service.execute(['a', 'b', 'c'], ['a', 'b'])).toBe(67)
  })

  it('ignoriert completedIds die nicht in habitIds enthalten sind', () => {
    expect(service.execute(['a', 'b'], ['a', 'x'])).toBe(50)
  })

  it('gibt 0 zurück wenn habitIds leer aber completedIds vorhanden', () => {
    expect(service.execute([], ['a', 'b'])).toBe(0)
  })
})
