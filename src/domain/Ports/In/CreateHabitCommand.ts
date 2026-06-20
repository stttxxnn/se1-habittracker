import { Habit } from '../../models/Habit'
import { HabitData } from '../Out/HabitRepositoryPort'

export interface CreateHabitCommand {
  // Die UI darf diese Methode aufrufen, um ein neues Habit anzulegen
  execute(data: HabitData): Promise<Habit>
}
