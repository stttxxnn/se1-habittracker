import { Habit } from '../../models/Habit'

export interface UpdateHabitCommand {
  // Die UI darf diese Methode aufrufen, um ein bestehendes Habit zu bearbeiten
  execute(id: string, title: string): Promise<Habit>
}
