export interface Habit {
  id: string;
  title: string;
  createdAt: Date;
  // Optionale Felder – werden nach DB-Migration befüllt
  scheduledTime?: string;      // Format: 'HH:MM' (z. B. '18:00')
  duration?: number;           // Dauer in Minuten
  color?: string;              // Hex-Farbe (z. B. '#3cb44b')
}
