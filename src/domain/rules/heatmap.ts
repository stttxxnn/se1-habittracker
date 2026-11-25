import type { Habit } from '@/domain/models/Habit'
import { isScheduledFor } from '@/domain/rules/habitSchedule'
import { toIsoDate } from '@/domain/rules/calendarDay'

// Fachliche Regel: Wie stark wird ein Tag in der Analytics-Heatmap eingefärbt?
// Reine Funktionen ohne Vue, Store oder Datenbank, dadurch mit festen Daten testbar.
// Siehe Aufgabe #109 (gehört zu #15) und Vault-Notiz "Habittracker Befunde und Ideen" (F-016).

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

export interface HeatmapDay {
  date: string // lokales Kalenderdatum 'YYYY-MM-DD' (siehe toIsoDate)
  completed: number // Anzahl Habits, die an diesem Tag erledigt wurden
  scheduled: number // Anzahl Habits, die an diesem Tag eingeplant waren
  level: HeatmapLevel
}

// Stufe nach Anteil erledigter zu eingeplanter Habits, nicht nach absoluter Anzahl
// wie bei GitHub-Contributions: Die Anzahl der Habits schwankt stark zwischen
// Nutzer:innen, ein absoluter Schwellenwert wäre dadurch nicht vergleichbar.
export function levelFor(completed: number, scheduled: number): HeatmapLevel {
  if (scheduled === 0 || completed === 0) return 0

  const ratio = completed / scheduled
  if (ratio >= 1) return 4
  if (ratio >= 0.75) return 3
  if (ratio >= 0.5) return 2
  return 1
}

// Baut die Heatmap-Tage für einen Zeitraum. "scheduled" nutzt dieselbe Regel wie
// die Tagesübersicht (isScheduledFor aus #92), "completed" kommt von außen als
// Anzahl erledigter Habits pro Kalendertag (z. B. aus completedDatesByHabit im Store).
export function buildHeatmap(
  habits: Habit[],
  completedCountByDate: Map<string, number>,
  days: Date[],
): HeatmapDay[] {
  return days.map(date => {
    const iso = toIsoDate(date)
    const scheduled = habits.filter(h => isScheduledFor(h, date)).length
    const completed = completedCountByDate.get(iso) ?? 0
    return { date: iso, completed, scheduled, level: levelFor(completed, scheduled) }
  })
}
