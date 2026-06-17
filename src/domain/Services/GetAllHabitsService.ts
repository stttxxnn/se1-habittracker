import { GetAllHabitsQuery } from '../Ports/In/GetAllHabitsQuery'
import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort'
import { Habit } from '../models/Habit'

export class GetAllHabitsService implements GetAllHabitsQuery {
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(): Promise<Habit[]> {
    return await this.habitRepository.findAll()
  }
}
