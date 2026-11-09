import { HabitCompletion } from '@/domain/models/HabitCompletion'
import { HabitRepositoryPort, HabitData, HabitCompletionData } from '../../domain/Ports/Out/HabitRepositoryPort'
import type { Habit, Periodicity, Weekday } from '../../domain/models/Habit'
import { supabase } from '../supabase/supabaseClient'

// Repräsentiert eine Zeile aus der habits-Tabelle in Supabase
type HabitRow = {
  id: string
  title: string
  created_at: string
  periodicity?: string | null
  weekdays?: string[] | null
  scheduled_time?: string | null
  duration_minutes?: number | null
  color?: string | null
  icon?: string | null
  reason?: string | null
}

type CompletionRow = {
    id: string,
    habit_id: string,
    user_id: string,
    created_at: string,
    completed_date: string,
    is_completed: boolean, //automatically converted by supabase upon request?
}

// Alle Spalten die gelesen werden — einmal definiert, überall genutzt
const SELECT_COLS =
  'id, title, created_at, periodicity, weekdays, scheduled_time, duration_minutes, color, icon, reason'

const SELECT_COLS_COMPLETIONS =
  'id, habit_id, user_id, created_at, completed_date, is_completed'

export class SupabaseHabitAdapter implements HabitRepositoryPort {

  // Mapping: DB-Zeile → sauberes Domänen-Objekt
  private mapToHabit(row: HabitRow): Habit {
    return {
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      periodicity: (row.periodicity as Periodicity) ?? undefined,
      weekdays: (row.weekdays as Weekday[]) ?? undefined,
      scheduledTime: row.scheduled_time ?? undefined,
      duration: row.duration_minutes ?? undefined,
      color: row.color ?? undefined,
      icon: row.icon ?? undefined,
      reason: row.reason ?? undefined
    }
  }

  async findById(id: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .select(SELECT_COLS)
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new Error(`Habit mit der ID ${id} wurde nicht gefunden.`)
    }

    return this.mapToHabit(data as HabitRow)
  }

  async findAll(): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select(SELECT_COLS)
      .order('scheduled_time', { ascending: true, nullsFirst: false })

    if (error) {
      throw new Error(`Fehler beim Laden aller Habits: ${error.message}`)
    }

    return (data ?? []).map(row => this.mapToHabit(row as HabitRow))
  }

  async save(habitData: HabitData): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        title: habitData.title,
        periodicity: habitData.periodicity ?? null,
        weekdays: habitData.weekdays ?? null,
        scheduled_time: habitData.scheduledTime ?? null,
        duration_minutes: habitData.duration ?? null,
        color: habitData.color ?? null,
        icon: habitData.icon ?? null,
        reason: habitData.reason ?? null
      })
      .select(SELECT_COLS)
      .single()

    if (error || !data) {
      throw new Error(`Habit konnte nicht gespeichert werden: ${error?.message}`)
    }

    return this.mapToHabit(data as HabitRow)
  }

  async update(id: string, habitData: HabitData): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update({
        title: habitData.title,
        periodicity: habitData.periodicity ?? null,
        weekdays: habitData.weekdays ?? null,
        scheduled_time: habitData.scheduledTime ?? null,
        duration_minutes: habitData.duration ?? null,
        color: habitData.color ?? null,
        icon: habitData.icon ?? null,
        reason: habitData.reason ?? null
      })
      .eq('id', id)
      .select(SELECT_COLS)
      .single()

    if (error || !data) {
      throw new Error(`Habit konnte nicht aktualisiert werden: ${error?.message}`)
    }

    return this.mapToHabit(data as HabitRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Habit konnte nicht gelöscht werden: ${error.message}`)
    }
  }

  private mapToHabitCompletion(row: CompletionRow): HabitCompletion {
    var completion: HabitCompletion = {
        id: row.id,
        habit_id: row.habit_id,
        completed_date: row.completed_date,
        user_id: row.user_id ?? undefined,
        is_completed: (row.is_completed as boolean)
    }
    return completion
  }

  async completeForDay(habitId: string, date: string): Promise<void> {
    var curHabit = await this.getCompletionOrNullByIdAndDate(habitId, date)
      var completionData: HabitCompletionData = {
          habit_id: habitId,
          user_id: undefined,
          completed_date: date,
          is_completed: true
      }
      if(curHabit === null){ //if no entry for today, insert
        const { error } = await supabase
          .from('habit_completions')
          .insert(completionData)
        if (error) {
          throw new Error(`Fehler beim inserting Habit Completion: ${error.message}`)
        }
      } else { //else update with new status
        const { error } = await supabase
          .from('habit_completions')
          .update({is_completed: true})
          .eq('habit_id', habitId)
          .eq('completed_date', date)
        if (error) {
          throw new Error(`Fehler beim inserting Habit Completion: ${error.message}`)
        }
      }
  }

  async uncompleteForDay(habitId: string, date: string): Promise<void> {
    var curHabit = await this.getCompletionOrNullByIdAndDate(habitId, date)
      var completionData: HabitCompletionData = {
          habit_id: habitId,
          user_id: undefined,
          completed_date: date,
          is_completed: false
      }
      if(curHabit === null){ //if no entry for today, insert
        const { error } = await supabase
          .from('habit_completions')
          .insert(completionData)
        if (error) {
          throw new Error(`Fehler beim inserting Habit Completion: ${error.message}`)
        }
      } else { //else update with new status
        const { error } = await supabase
          .from('habit_completions')
          .update({is_completed: false})
          .eq('habit_id', habitId)
          .eq('completed_date', date)
        if (error) {
          throw new Error(`Fehler beim inserting Habit Completion: ${error.message}`)
        }
      }
  }

  async getCompletionOrNullByIdAndDate(habitId: string, date: string): Promise<HabitCompletion | null>{
    const { data, error } = await supabase
      .from('habit_completions')
      .select(SELECT_COLS_COMPLETIONS)
      .eq('habit_id', habitId)
      .eq('completed_date', date)
      .maybeSingle()

    if (error) {
      throw new Error(`Habit mit der ID ${habitId} wurde nicht gefunden.`)
    }

    if (data === null){ //if nothing is found
      return null
    }

    return this.mapToHabitCompletion(data as CompletionRow)
  }

  async getCompletionsForDay(date: string): Promise<HabitCompletion[]> {
      const today = new Date().toISOString().split('T')[0]
      //since we are saving status and logging all changes inside that table,
      //we need to get only last entry inside every id group, that was completed!
      const { data, error } = await supabase
          .from('habit_completions')
          .select(SELECT_COLS_COMPLETIONS)
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

      const latestEntries = Array.from(latestByHabit.values()).filter(completion => completion.is_completed === true)
      return latestEntries.map(row => this.mapToHabitCompletion(row as CompletionRow))
  }
}
