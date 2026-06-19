import { HabitRepositoryPort } from '../../domain/Ports/Out/HabitRepositoryPort'
import type { Habit, Periodicity, Weekday } from '../../domain/models/Habit'
import { supabase } from '../supabase/supabaseClient'

type HabitRow = {
  id: string
  title: string
  created_at: string
  periodicity?: string | null
  weekdays?: string[] | null
  scheduled_time?: string | null
  duration_minutes?: number | null
  color?: string | null
}

const SELECT_COLS =
  'id, title, created_at, periodicity, weekdays, scheduled_time, duration_minutes, color'

export class SupabaseHabitAdapter implements HabitRepositoryPort {

  private mapToHabit(data: HabitRow): Habit {
    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at),
      periodicity: (data.periodicity as Periodicity) ?? undefined,
      weekdays: (data.weekdays as Weekday[]) ?? undefined,
      scheduledTime: data.scheduled_time ?? undefined,
      duration: data.duration_minutes ?? undefined,
      color: data.color ?? undefined
    }
  }

  async findById(id: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .select(SELECT_COLS)
      .eq('id', id)
      .single()
    if (error || !data) throw new Error(`Habit mit ID ${id} nicht gefunden.`)
    return this.mapToHabit(data as HabitRow)
  }

  async findAll(): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select(SELECT_COLS)
      .order('scheduled_time', { ascending: true, nullsFirst: false })
    if (error) throw new Error(`Fehler beim Laden: ${error.message}`)
    return (data ?? []).map(d => this.mapToHabit(d as HabitRow))
  }

  async save(habitData: {
    title: string
    periodicity?: string
    weekdays?: string[]
    scheduledTime?: string
    duration?: number
    color?: string
  }): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        title: habitData.title,
        periodicity: habitData.periodicity ?? null,
        weekdays: habitData.weekdays ?? null,
        scheduled_time: habitData.scheduledTime ?? null,
        duration_minutes: habitData.duration ?? null,
        color: habitData.color ?? null
      })
      .select(SELECT_COLS)
      .single()
    if (error || !data) throw new Error(`Fehler beim Speichern: ${error?.message}`)
    return this.mapToHabit(data as HabitRow)
  }

  async update(id: string, habitData: { title: string }): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update({ title: habitData.title })
      .eq('id', id)
      .select(SELECT_COLS)
      .single()
    if (error || !data) throw new Error(`Fehler beim Aktualisieren: ${error?.message}`)
    return this.mapToHabit(data as HabitRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Fehler beim Löschen: ${error.message}`)
  }
}
