-- Migration: Add timeline-relevant fields to habits table
-- Branch: feature/timeline-daily-habits
-- Status: ALREADY EXECUTED on Supabase (2026-06-20)
--
-- Adds: periodicity, weekdays, scheduled_time, duration_minutes, color
-- Note: icon and reason columns are added in feature/habit-full-schema

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS periodicity      TEXT    NULL,
  ADD COLUMN IF NOT EXISTS weekdays         TEXT[]  NULL,
  ADD COLUMN IF NOT EXISTS scheduled_time   TEXT    NULL,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NULL,
  ADD COLUMN IF NOT EXISTS color            TEXT    NULL;

ALTER TABLE habits
  ADD CONSTRAINT habits_periodicity_check
  CHECK (periodicity IN ('daily', 'weekly', 'monthly') OR periodicity IS NULL);
