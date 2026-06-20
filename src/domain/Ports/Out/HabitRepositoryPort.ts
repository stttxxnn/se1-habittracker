import { Habit } from '../../models/Habit'

export interface HabitRepositoryPort {
  findById(id: string): Promise<Habit>
  findAll(): Promise<Habit[]>
  save(habitData: {
    title: string
    periodicity?: string
    weekdays?: string[]
    scheduledTime?: string
    duration?: number
    color?: string
  }): Promise<Habit>
  update(id: string, habitData: { title: string }): Promise<Habit>
  delete(id: string): Promise<void>
}
