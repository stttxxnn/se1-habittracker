import { CreateHabitCommand } from '../Ports/In/CreateHabitCommand'
import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort'
import { Habit } from '../models/Habit'

export class CreateHabitService implements CreateHabitCommand {
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(title: string): Promise<Habit> {
    if (!title || title.trim() === '') {
      throw new Error('Der Titel eines Habits darf nicht leer sein.')
    }
    return await this.habitRepository.save({ title: title.trim() })
  }
}
