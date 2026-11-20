import { HabitCompletion } from '../models/HabitCompletion'
import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort'

export class GetAllCompletionsService {
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(): Promise<HabitCompletion[]> {
    return await this.habitRepository.getAllCompletions()
  }
}
