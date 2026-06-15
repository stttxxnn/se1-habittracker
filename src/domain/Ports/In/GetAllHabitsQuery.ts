import { Habit } from '../../models/Habit'

export interface GetAllHabitsQuery {
  // Die UI darf diese Methode aufrufen, um alle Habits zu laden
  execute(): Promise<Habit[]>
}
