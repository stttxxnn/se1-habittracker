import type { Habit } from '@/domain/models/Habit'
import { isScheduledFor } from '@/domain/rules/habitSchedule'
import { addDays, parseIsoDate, toIsoDate } from '@/domain/rules/calendarDay'

// Fachliche Regel: Wie lang ist die Streak eines Habits?
// Reine Funktion ohne Vue, Store oder Datenbank, dadurch mit festen Daten testbar.

export type StreakResult = {
  current: number // aktuelle Streak (eingeplante Tage in Folge erledigt)
  best: number    // Rekord (längste Streak bisher)
}

// Regeln aus der Design-Impact-Analyse #84:
// R1: pro Tag zählt nur ein Haken
// R2: Streak = eingeplante Tage in Folge mit Haken
// R3: eingeplanter Tag ohne Haken → Streak beginnt von vorn
// R4: nicht eingeplante Tage (z. B. bei 'weekly') unterbrechen die Streak nicht
// R5: heute zählt erst nach Mitternacht als verpasst
// R6: der Rekord sinkt nie (er wird aus der ganzen Historie berechnet)
// Den Recovery-Mode gibt es noch nicht, er wird daher nicht berücksichtigt.
export function calculateStreak(habit: Habit, completedDates: string[], today: Date): StreakResult {
  const todayIso = toIsoDate(today)

  // R1: doppelte Haken zählen einmal; Haken in der Zukunft werden ignoriert
  const done = new Set(completedDates.filter(d => d <= todayIso))
  if (done.size === 0) return { current: 0, best: 0 }

  const firstDay = parseIsoDate([...done].sort()[0])
  const lastDay = parseIsoDate(todayIso)

  // Vorwärts durch die Historie: Rekord und aktuelle Serie in einem Durchlauf
  let run = 0
  let best = 0
  for (let day = firstDay; day <= lastDay; day = addDays(day, 1)) {
    if (!isScheduledFor(habit, day)) continue // R4

    const iso = toIsoDate(day)
    if (done.has(iso)) {
      run++                                   // R2
      best = Math.max(best, run)
    } else if (iso !== todayIso) {
      run = 0                                 // R3 (R5: heute noch nicht)
    }
  }

  return { current: run, best }
}
