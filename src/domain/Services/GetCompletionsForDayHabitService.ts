import { HabitCompletionRepositoryPort} from '../Ports/Out/HabitCompletionRepositoryPort'
import { HabitCompletion } from '../models/HabitCompletion'

export class GetCompletionsForDayService{
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitCompletionRepository: HabitCompletionRepositoryPort) {}

  async execute(date: string): Promise<HabitCompletion[]> {
      return await this.habitCompletionRepository.getCompletionsForDay(date)
    }
}
