import type { CalculateDailyProgressQuery } from '../Ports/In/CalculateDailyProgressQuery'

export class CalculateDailyProgressService implements CalculateDailyProgressQuery {
  /**
   * Berechnet den Anteil erledigter Habits für den aktuellen Tag.
   * Gibt 0 zurück wenn keine Habits vorhanden sind.
   */
  execute(habitIds: string[], completedIds: string[]): number {
    if (habitIds.length === 0) return 0
    const completedSet = new Set(completedIds)
    const done = habitIds.filter(id => completedSet.has(id)).length
    return Math.round((done / habitIds.length) * 100)
  }
}
