-- Migration: Habit-Tabelle um alle Formularfelder erweitern
-- Issue #66 — feat(#64-68)
-- Ausführen im Supabase SQL-Editor: https://supabase.com/dashboard/project/cfdwmeozyewwfbucfgep/sql

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS periodicity      TEXT    NULL,
  ADD COLUMN IF NOT EXISTS weekdays         TEXT[]  NULL,
  ADD COLUMN IF NOT EXISTS scheduled_time   TEXT    NULL,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NULL,
  ADD COLUMN IF NOT EXISTS color            TEXT    NULL,
  ADD COLUMN IF NOT EXISTS icon             TEXT    NULL,
  ADD COLUMN IF NOT EXISTS reason           TEXT    NULL;

-- Constraints: Nur erlaubte Werte für periodicity
ALTER TABLE habits
  ADD CONSTRAINT habits_periodicity_check
  CHECK (periodicity IN ('daily', 'weekly', 'monthly') OR periodicity IS NULL);

-- Kontrolle: Spalten prüfen
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'habits'
ORDER BY ordinal_position;
