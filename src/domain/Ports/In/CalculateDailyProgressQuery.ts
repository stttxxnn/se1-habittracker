/**
 * Port (In): Berechnet den Tagesfortschritt als Prozentwert.
 * Pure Funktion — keine Datenbankabhängigkeit.
 */
export interface CalculateDailyProgressQuery {
  /**
   * @param habitIds    IDs aller heute fälligen Habits
   * @param completedIds IDs der für heute bereits abgehakten Habits
   * @returns Prozentwert 0–100 (gerundet auf ganze Zahlen)
   */
  execute(habitIds: string[], completedIds: string[]): number
}
