import { UpdateHabitCommand } from '../Ports/In/UpdateHabitCommand'
import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort'
import { Habit } from '../models/Habit'

export class UpdateHabitService implements UpdateHabitCommand {
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(id: string, title: string): Promise<Habit> {
    if (!id) throw new Error('ID darf nicht leer sein.')
    if (!title || title.trim() === '') throw new Error('Der Titel darf nicht leer sein.')
    return await this.habitRepository.update(id, { title: title.trim() })
  }
}
