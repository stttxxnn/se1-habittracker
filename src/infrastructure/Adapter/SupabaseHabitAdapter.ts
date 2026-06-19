import { HabitRepositoryPort } from '../../domain/Ports/Out/HabitRepositoryPort'
import { Habit } from '../../domain/models/Habit'
import { supabase } from '../supabase/supabaseClient'

// DB-Typ für alle Spalten die wir selektieren
type HabitRow = {
  id: string
  title: string
  created_at: string
  scheduled_time?: string | null
  duration_minutes?: number | null
  color?: string | null
}

export class SupabaseHabitAdapter implements HabitRepositoryPort {

  // Mapping: DB-Zeile → sauberes Domänenobjekt
  private mapToHabit(data: HabitRow): Habit {
    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at),
      scheduledTime: data.scheduled_time ?? undefined,
      duration: data.duration_minutes ?? undefined,
      color: data.color ?? undefined
    }
  }

  // ISO-Datumsstring für heute (YYYY-MM-DD) in lokaler Zeit
  private todayIso(): string {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  async findById(id: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .select('id, title, created_at, scheduled_time, duration_minutes, color')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new Error(`Habit mit der ID ${id} wurde nicht gefunden.`)
    }

    return this.mapToHabit(data as HabitRow)
  }

  async findAll(): Promise<Habit[]> {
    // Nur Habits des heutigen Tages laden.
    // Fallback: Falls scheduled_date noch nicht in der DB existiert,
    // werden alle Habits geladen und clientseitig gefiltert (siehe HomeView).
    const { data, error } = await supabase
      .from('habits')
      .select('id, title, created_at, scheduled_time, duration_minutes, color')
      .order('scheduled_time', { ascending: true })

    if (error) {
      throw new Error(`Fehler beim Laden aller Habits: ${error.message}`)
    }

    return (data ?? []).map(d => this.mapToHabit(d as HabitRow))
  }

  async save(habitData: { title: string }): Promise<Habit> {
    const { data: inserted, error } = await supabase
      .from('habits')
      .insert({ title: habitData.title })
      .select('id, title, created_at, scheduled_time, duration_minutes, color')
      .single()

    if (error || !inserted) {
      throw new Error(`Habit konnte nicht gespeichert werden: ${error?.message}`)
    }

    return this.mapToHabit(inserted as HabitRow)
  }

  async update(id: string, habitData: { title: string }): Promise<Habit> {
    const { data: updated, error } = await supabase
      .from('habits')
      .update({ title: habitData.title })
      .eq('id', id)
      .select('id, title, created_at, scheduled_time, duration_minutes, color')
      .single()

    if (error || !updated) {
      throw new Error(`Habit konnte nicht aktualisiert werden: ${error?.message}`)
    }

    return this.mapToHabit(updated as HabitRow)
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
