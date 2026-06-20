export type Periodicity = 'daily' | 'weekly' | 'monthly'

export type Weekday =
  | 'monday' | 'tuesday' | 'wednesday'
  | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface Habit {
  id: string
  title: string
  createdAt: Date
  // Wiederholung
  periodicity?: Periodicity
  weekdays?: Weekday[]      // nur relevant wenn periodicity === 'weekly'
  // Zeitplanung
  scheduledTime?: string    // 'HH:MM'
  duration?: number         // Minuten
  color?: string            // Hex
}
