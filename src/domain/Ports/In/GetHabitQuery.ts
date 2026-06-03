// Datei: src/domain/ports/in/GetHabitQuery.ts
import { Habit } from '../../models/Habit';

export interface GetHabitQuery {
  // Die UI darf diese Methode aufrufen, um ein Habit abzufragen
  execute(id: string): Promise<Habit>;
}
