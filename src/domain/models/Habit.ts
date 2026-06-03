export interface Habit {
  id: string;
  userId: string;
  title: string;
  streakCount: number;
  createdAt: Date;
}

export function incrementStreak(habit: Habit): Habit {
  return {
    ...habit,
    streakCount: habit.streakCount + 1
  };
}