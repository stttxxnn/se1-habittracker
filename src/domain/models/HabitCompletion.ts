//in runtime Status should be of type "string"
export type Status =
  | 'erledigt'
  | 'verpasst'
  | 'nicht_erledigt'

export interface HabitCompletion {
    //in class: TS wants string to be initialized. ! says that this values cant be null
    id: string;
    habit_id: string;
    completed_date: string; // 'YYYY-MM-DD'
    //for later
    user_id?: string
    status?: Status
}