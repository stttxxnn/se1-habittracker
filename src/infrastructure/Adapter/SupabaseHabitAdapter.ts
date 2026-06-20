import { HabitRepositoryPort, HabitData } from '../../domain/Ports/Out/HabitRepositoryPort'
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

// Alle Spalten die gelesen werden — einmal definiert, überall genutzt
const SELECT_COLS =
  'id, title, created_at, periodicity, weekdays, scheduled_time, duration_minutes, color, icon, reason'

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
      .order('created_at', { ascending: false })

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
}
