// Kalendertage im Format 'YYYY-MM-DD' (wie completed_date in habit_completions).
// Immer in lokaler Zeit: toISOString() würde UTC liefern und kurz nach Mitternacht
// den Vortag ergeben.

// Datum → 'YYYY-MM-DD' in lokaler Zeit
export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 'YYYY-MM-DD' → Date um 00:00 Uhr lokaler Zeit
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Datum um n Kalendertage verschieben (auch über Zeitumstellungen korrekt)
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}
