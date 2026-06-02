import { GetHabitQuery } from '../Ports/In/GetHabitQuery';
import { HabitRepositoryPort } from '../Ports/Out/HabitRepositoryPort';
import { Habit } from '../models/Habit';

export class GetHabitService implements GetHabitQuery {
  // Der Service weiß nicht, dass Supabase existiert. Er kennt nur den Port!
  constructor(private habitRepository: HabitRepositoryPort) {}

  async execute(id: string): Promise<Habit> {
    if (!id) throw new Error('ID darf nicht leer sein.');

    // Aufruf über das Interface
    return await this.habitRepository.findById(id);
  }
}
