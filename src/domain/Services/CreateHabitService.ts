import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort'
import { Habit } from '../models/Habit'

export class CreateHabitService {
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(
    title: string,
    options?: { scheduledTime?: string; duration?: number; color?: string }
  ): Promise<Habit> {
    if (!title || title.trim() === '') {
      throw new Error('Der Titel eines Habits darf nicht leer sein.')
    }
    return await this.habitRepository.save({
      title: title.trim(),
      scheduledTime: options?.scheduledTime,
      duration: options?.duration,
      color: options?.color
    })
  }
}
