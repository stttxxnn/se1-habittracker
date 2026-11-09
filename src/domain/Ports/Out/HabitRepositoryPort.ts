import { HabitCompletion, Status } from '@/domain/models/HabitCompletion'
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

export type HabitCompletionData = {
    //id: string;
    habit_id: string;
    user_id?: string;
    completed_date: string; // 'YYYY-MM-DD'
    status?: Status; // TEST
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

  completeForDay(habitId: string, date: string): Promise<void>;
  uncompleteForDay(habitId: string, date: string): Promise<void>;
  getCompletionsForDay(date: string): Promise<HabitCompletion[]>;
}
