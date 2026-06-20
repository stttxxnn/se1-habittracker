import { Habit } from '../../models/Habit'
import { HabitData } from '../Out/HabitRepositoryPort'

export interface UpdateHabitCommand {
  // Die UI darf diese Methode aufrufen, um ein bestehendes Habit zu bearbeiten
  execute(id: string, data: HabitData): Promise<Habit>
}
