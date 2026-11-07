import { HabitCompletionRepositoryPort, HabitCompletionData } from '../Ports/Out/HabitCompletionRepositoryPort'

export class CompleteHabitService{
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitCompletionRepository: HabitCompletionRepositoryPort) {}

  async execute(habitId: string, date: string): Promise<void> {
    if (!habitId) throw new Error('ID darf nicht leer sein.')
    await this.habitCompletionRepository.completeForDay(habitId, date)
  }
}
