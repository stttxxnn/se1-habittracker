import { Habit } from '../../models/Habit'

export interface HabitRepositoryPort {
  // Definiert, dass man ein Habit anhand seiner ID suchen kann
  findById(id: string): Promise<Habit>;
}
