import { HabitRepositoryPort } from '../../domain/Ports/Out/HabitRepositoryPort'
import { Habit } from '../../domain/models/Habit'
import { supabase } from '../supabase/supabaseClient'

export class SupabaseHabitAdapter implements HabitRepositoryPort {

  // Mapping: DB-Zeile → sauberes Domänen-Objekt (einmal definiert, überall genutzt)
  private mapToHabit(data: { id: string; title: string; created_at: string }): Habit {
    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at)
    }
  }

  async findById(id: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .select('id, title, created_at')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new Error(`Habit mit der ID ${id} wurde nicht gefunden.`)
    }

    return this.mapToHabit(data)
  }

  async findAll(): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Fehler beim Laden aller Habits: ${error.message}`)
    }

    return (data ?? []).map(d => this.mapToHabit(d))
  }

  async save(habitData: { title: string }): Promise<Habit> {
    const { data: inserted, error } = await supabase
      .from('habits')
      .insert({ title: habitData.title })
      .select('id, title, created_at')
      .single()

    if (error || !inserted) {
      throw new Error(`Habit konnte nicht gespeichert werden: ${error?.message}`)
    }

    return this.mapToHabit(inserted)
  }

  async update(id: string, habitData: { title: string }): Promise<Habit> {
    const { data: updated, error } = await supabase
      .from('habits')
      .update({ title: habitData.title })
      .eq('id', id)
      .select('id, title, created_at')
      .single()

    if (error || !updated) {
      throw new Error(`Habit konnte nicht aktualisiert werden: ${error?.message}`)
    }

    return this.mapToHabit(updated)
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
