import { DeleteHabitCommand } from '../Ports/In/DeleteHabitCommand'
import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort'

export class DeleteHabitService implements DeleteHabitCommand {
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error('ID darf nicht leer sein.')
    await this.habitRepository.delete(id)
  }
}
