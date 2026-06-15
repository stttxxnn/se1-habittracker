import { Habit } from '../../models/Habit'

export interface CreateHabitCommand {
  // Die UI darf diese Methode aufrufen, um ein neues Habit anzulegen
  execute(title: string): Promise<Habit>
}
