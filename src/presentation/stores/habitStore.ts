import { defineStore } from 'pinia'
import { computed, inject, ref } from 'vue'
import type { Habit } from '@/domain/models/Habit'
import { HabitCompletion } from '@/domain/models/HabitCompletion'
import type { HabitData } from '@/domain/Ports/Out/HabitRepositoryPort'
import { HABIT_USE_CASES } from '@/compositionRoot'
import { calculateStreak, type StreakResult } from '@/domain/rules/streak'

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([])
  const habitsCompletionsToday = ref<HabitCompletion[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const habitToEdit = ref<Habit | null>(null)

  // Completion state persists across navigation (store survives view unmount)
  const completedHabitIds = ref<Set<string>>(new Set())
  const hiddenHabitIds = ref<Set<string>>(new Set())

  // Alle Tage, an denen ein Habit abgehakt wurde ('YYYY-MM-DD'), je Habit-ID
  const completedDatesByHabit = ref<Record<string, string[]>>({})

  // Streak je Habit; die Regel selbst liegt in der Domäne (calculateStreak)
  const streaks = computed<Record<string, StreakResult>>(() => {
    const today = new Date()
    const result: Record<string, StreakResult> = {}
    for (const habit of habits.value) {
      result[habit.id] = calculateStreak(habit, completedDatesByHabit.value[habit.id] ?? [], today)
    }
    return result
  })

  // Use Cases kommen aus der Composition Root (main.ts), der Store kennt nur die Ports
  const injectedUseCases = inject(HABIT_USE_CASES)
  if (!injectedUseCases) throw new Error('HabitUseCases wurden nicht bereitgestellt')
  const useCases = injectedUseCases

  //
  async function loadHabit(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const habit = await useCases.getHabit.execute(id)
      habits.value = [habit]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unbekannter Fehler'
    } finally {
      isLoading.value = false
    }
  }

  async function loadAllHabits() {
    isLoading.value = true
    error.value = null
    try {
      habits.value = await useCases.getAllHabits.execute()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
    } finally {
      isLoading.value = false
    }
  }

  // Neues Habit erstellen und direkt in die Liste einfügen
  async function createHabit(data: HabitData) {
    isLoading.value = true
    error.value = null
    try {
      const newHabit = await useCases.createHabit.execute(data)
      habits.value.unshift(newHabit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Erstellen'
    } finally {
      isLoading.value = false
    }
  }

  // Bestehendes Habit aktualisieren
  async function updateHabit(id: string, data: HabitData) {
    isLoading.value = true 
    error.value = null
    try {
      const updated = await useCases.updateHabit.execute(id, data)
      const index = habits.value.findIndex(h => h.id === id)
      if (index !== -1) habits.value[index] = updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Bearbeiten'
    } finally {
      isLoading.value = false
    }
  }

  async function deleteHabit(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await useCases.deleteHabit.execute(id)
      habits.value = habits.value.filter(h => h.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen'
    } finally {
      isLoading.value = false
    }
  }

  //writting to db
  //TODO: merge complete and uncomplete, move toggleCompletion logic from habitStore to Service
  async function toggleCompletion(habitId: string, date: string, status: boolean){
    isLoading.value = true 
    error.value = null
    var currentService;
    if (status === true){
      currentService = useCases.completeHabit
    } else if(status === false){
      currentService = useCases.uncompleteHabit
    } else {
      throw new Error("uncorrect status in toggleCompletion")
      return
    }
    
    try {
      await currentService.execute(habitId, date)
      updateCompletedDates(habitId, date, status)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Bearbeiten'
    } finally {
      isLoading.value = false
    }
    
  }

  //loading on app-start
  async function loadCompletionsForToday(date: string){
    isLoading.value = true
    error.value = null
    try {
      habitsCompletionsToday.value = await useCases.getCompletionsForDay.execute(date)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
    } finally {
      isLoading.value = false
    }
  }

  // Lädt alle Haken aller Habits, damit die Streaks berechnet werden können
  async function loadCompletionHistory() {
    error.value = null
    try {
      const completions = await useCases.getAllCompletions.execute()
      const byHabit: Record<string, string[]> = {}
      for (const c of completions) {
        (byHabit[c.habit_id] ??= []).push(c.completed_date)
      }
      completedDatesByHabit.value = byHabit
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
    }
  }

  // Hält die Historie nach dem Ab- oder Anhaken aktuell, ohne alles neu zu laden
  function updateCompletedDates(habitId: string, date: string, completed: boolean) {
    const dates = (completedDatesByHabit.value[habitId] ?? []).filter(d => d !== date)
    if (completed) dates.push(date)
    completedDatesByHabit.value = { ...completedDatesByHabit.value, [habitId]: dates }
  }

  // Setzt das Habit das bearbeitet werden soll (vor Navigation zu HabitEditView)
  function setHabitToEdit(habit: Habit) { habitToEdit.value = habit }
  function clearHabitToEdit() { habitToEdit.value = null }
  function setHabits(newHabits: Habit[]) { habits.value = newHabits }

  return {
    habits, habitsCompletionsToday,
    isLoading, error, habitToEdit,
    completedHabitIds, hiddenHabitIds,
    completedDatesByHabit, streaks,
    loadHabit, loadAllHabits, createHabit,
    updateHabit, deleteHabit,
    toggleCompletion, loadCompletionsForToday, loadCompletionHistory,
    setHabitToEdit, clearHabitToEdit, setHabits
  }
})
