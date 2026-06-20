import { CreateHabitCommand } from '../Ports/In/CreateHabitCommand'
import { HabitRepositoryPort, HabitData } from '../Ports/Out/HabitRepositoryPort'
import { Habit } from '../models/Habit'

export class CreateHabitService implements CreateHabitCommand {
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(data: HabitData): Promise<Habit> {
    if (!data.title || data.title.trim() === '') {
      throw new Error('Der Titel eines Habits darf nicht leer sein.')
    }
    return await this.habitRepository.save({
      ...data,
      title: data.title.trim()
    })
  }
}
