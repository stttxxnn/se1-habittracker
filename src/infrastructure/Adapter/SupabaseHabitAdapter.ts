
import { HabitRepositoryPort } from '../../domain/Ports/Out/HabitRepositoryPort';
import { Habit } from '../../domain/models/Habit';
import { supabase } from '../supabase/supabaseClient'; // Euer Client aus der .env


export class SupabaseHabitAdapter implements HabitRepositoryPort {

  async findById(id: string): Promise<Habit> {
    // 1. Daten aus der Supabase-PostgreSQL-Tabelle abfragen
    const { data, error } = await supabase
      .from('habits')
      .select('id, title, created_at')
      .eq('id', id)
      .single();

    // 2. Fehlerbehandlung, falls das Habit nicht existiert
    if (error || !data) {
      throw new Error(`Habit mit der ID ${id} wurde nicht gefunden.`);
    }

    // 3. Mapping: Die DB-Daten in euer sauberes Domänen-Modell umwandeln
    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at) // String aus DB zu echtem JS-Date machen
    };
  }
}
