import { HabitCompletion } from '../models/HabitCompletion'
import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort'

export class GetCompletionsForDayService{
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(date: string): Promise<HabitCompletion[]> {
      return await this.habitRepository.getCompletionsForDay(date)
    }
}
