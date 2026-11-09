import { HabitRepositoryPort } from "../Ports/Out/HabitRepositoryPort"

export class CompleteHabitService{
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(habitId: string, date: string): Promise<void> {
    if (!habitId) throw new Error('ID darf nicht leer sein.')
    await this.habitRepository.completeForDay(habitId, date)
  }
}
