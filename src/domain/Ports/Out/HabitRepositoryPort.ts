import { Habit } from '../../models/Habit'

// Daten die beim Erstellen oder Bearbeiten eines Habits übergeben werden können
export type HabitData = {
  title: string
  periodicity?: string
  weekdays?: string[]
  scheduledTime?: string
  duration?: number
  color?: string
  icon?: string
  reason?: string
}

export interface HabitRepositoryPort {
  // Liest ein einzelnes Habit anhand seiner ID
  findById(id: string): Promise<Habit>

  // Liest alle Habits
  findAll(): Promise<Habit[]>

  // Speichert ein neues Habit (ID und createdAt werden von der DB generiert)
  save(data: HabitData): Promise<Habit>

  // Aktualisiert ein bestehendes Habit
  update(id: string, data: HabitData): Promise<Habit>

  // Löscht ein Habit anhand seiner ID
  delete(id: string): Promise<void>
}
