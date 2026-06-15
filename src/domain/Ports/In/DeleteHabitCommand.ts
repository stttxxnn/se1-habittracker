export interface DeleteHabitCommand {
  // Die UI darf diese Methode aufrufen, um ein Habit zu löschen
  execute(id: string): Promise<void>
}
