import { HabitCompletion, Status } from '@/domain/models/HabitCompletion'
import { HabitCompletionRepositoryPort, HabitCompletionData} from '../../domain/Ports/Out/HabitCompletionRepositoryPort'
import { supabase } from '../supabase/supabaseClient'

type CompletionRow = {
    id: string,
    habit_id: string,
    user_id: string,
    created_at: string,
    completed_date: string,
    status: string,
}

const SELECT_COLS =
  'id, habit_id, user_id, created_at, completed_date, status'

export class SupabaseHabitCompletionAdapter implements HabitCompletionRepositoryPort {
    private mapToHabitCompletion(row: CompletionRow): HabitCompletion {
        var completion: HabitCompletion = {
            id: row.id,
            habit_id: row.habit_id,
            completed_date: row.completed_date,
            user_id: row.user_id ?? undefined,
            status: (row.status as Status)
        }
        return completion
      }
    
    async completeForDay(habitId: string, date: string): Promise<void> {
        var completionData: HabitCompletionData = {
            habit_id: habitId,
            user_id: undefined,
            completed_date: date,
            status: 'erledigt'
        }
        const { error } = await supabase
            .from('habit_completions')
            .insert(completionData)

            if (error) {
              throw new Error(`Fehler beim inserting Habit Completion: ${error.message}`)
            }
    }
    async uncompleteForDay(habitId: string, date: string): Promise<void> {
        var completionData: HabitCompletionData = {
            habit_id: habitId,
            user_id: undefined,
            completed_date: date,
            status: 'nicht_erledigt'
        }
        const { error } = await supabase
            .from('habit_completions')
            .insert(completionData)

        if (error) {
            throw new Error(`Fehler beim inserting Habit Completion: ${error.message}`)
        }
    }
    async getCompletionsForDay(date: string): Promise<HabitCompletion[]> {
        const today = new Date().toISOString().split('T')[0]
        //since we are saving status and logging all changes inside that table,
        //we need to get only last entry inside every id group, that was completed!
        const { data, error } = await supabase
            .from('habit_completions')
            .select(SELECT_COLS)
            .eq("completed_date", today)
            .order('created_at', { ascending: false }) //completed_date has only day
        if (error) {
            throw new Error(`Fehler beim getting Habit Completions for Day: ${error.message}`)
        }
        const latestByHabit = new Map<string, typeof data[number]>()

        for (const entry of data) {
            if (!latestByHabit.has(entry.habit_id)) {
                latestByHabit.set(entry.habit_id, entry)
            }
        }

        const latestEntries = Array.from(latestByHabit.values()).filter(completion => completion.status === 'erledigt')
        return latestEntries.map(row => this.mapToHabitCompletion(row as CompletionRow))
    }
    
}