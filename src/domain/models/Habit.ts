// Erlaubte Wiederholungsintervalle für ein Habit
export type Periodicity = 'daily' | 'weekly' | 'monthly'

// Erlaubte Wochentage (nur relevant wenn periodicity === 'weekly')
export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface Habit {
  id: string
  title: string
  createdAt: Date

  // Wiederholung
  periodicity?: Periodicity
  weekdays?: Weekday[]       // nur befüllt wenn periodicity === 'weekly'

  // Zeitplanung
  scheduledTime?: string     // Format: 'HH:MM'
  duration?: number          // Dauer in Minuten

  // Erscheinungsbild
  color?: string             // Hex-Farbcode, z.B. '#7b4dff'
  icon?: string              // Icon-Schlüssel, z.B. 'reading', 'sport'

  // Motivation
  reason?: string            // Freitext — warum möchte der Nutzer diese Gewohnheit?
}
