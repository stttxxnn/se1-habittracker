import { Habit } from '../../models/Habit'

export interface UpdateHabitCommand {
  // Die UI darf diese Methode aufrufen, um ein bestehendes Habit zu bearbeiten
  execute(id: string, data: {
    title: string
    periodicity?: string
    weekdays?: string[]
    scheduledTime?: string
    duration?: number
    color?: string
  }): Promise<Habit>
}
