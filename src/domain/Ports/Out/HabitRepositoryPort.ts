import { Habit } from '../../models/Habit'

export interface HabitRepositoryPort {
  // Liest ein einzelnes Habit anhand seiner ID
  findById(id: string): Promise<Habit>

  // Liest alle Habits
  findAll(): Promise<Habit[]>

  // Speichert ein neues Habit (ID und createdAt werden von der DB generiert)
  save(data: { title: string }): Promise<Habit>

  // Aktualisiert ein bestehendes Habit
  update(id: string, data: { title: string }): Promise<Habit>

  // Löscht ein Habit anhand seiner ID
  delete(id: string): Promise<void>
}
