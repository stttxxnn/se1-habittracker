import { HabitCompletion, Status } from '../../models/HabitCompletion'

export type HabitCompletionData = {
    //id: string;
    habit_id: string;
    user_id?: string;
    completed_date: string; // 'YYYY-MM-DD'
    status?: Status; // TEST
}

export interface HabitCompletionRepositoryPort {
  completeForDay(habitId: string, date: string): Promise<void>;
  uncompleteForDay(habitId: string, date: string): Promise<void>;
  getCompletionsForDay(date: string): Promise<HabitCompletion[]>;
}