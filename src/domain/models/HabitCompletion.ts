export interface HabitCompletion {
    //in class: TS wants string to be initialized. ! says that this values cant be null
    id: string;
    habit_id: string;
    completed_date: string; // 'YYYY-MM-DD'
    //for later
    user_id?: string
    is_completed: boolean
}