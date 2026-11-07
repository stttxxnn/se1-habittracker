import { defineStore } from 'pinia'
import { inject, ref } from 'vue'
import type { Habit } from '@/domain/models/Habit'
import type { HabitData } from '@/domain/Ports/Out/HabitRepositoryPort'
import { HABIT_USE_CASES } from '@/compositionRoot'
import { SupabaseHabitCompletionAdapter } from '@/infrastructure/Adapter/SupabaseHabitCompletionAdapter'
import { GetCompletionsForDayService } from '@/domain/Services/GetCompletionsForDayHabitService'
import { CompleteHabitService } from '@/domain/Services/CompleteHabitService'
import { UncompleteHabitService } from '@/domain/Services/UncompleteHabitService'
import { HabitCompletion, Status } from '@/domain/models/HabitCompletion'

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([])
  const habitsCompletionsToday = ref<HabitCompletion[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const habitToEdit = ref<Habit | null>(null)

  // Completion state persists across navigation (store survives view unmount)
  const completedHabitIds = ref<Set<string>>(new Set())
  const hiddenHabitIds = ref<Set<string>>(new Set())

  // Use Cases kommen aus der Composition Root (main.ts), der Store kennt nur die Ports
  const injectedUseCases = inject(HABIT_USE_CASES)
  if (!injectedUseCases) throw new Error('HabitUseCases wurden nicht bereitgestellt')
  const useCases = injectedUseCases

  const habitCompletionAdapter = new SupabaseHabitCompletionAdapter()
  const getCompletionsForDayService = new GetCompletionsForDayService(habitCompletionAdapter)
  const completeHabitService = new CompleteHabitService(habitCompletionAdapter)
  const uncompleteHabitService = new UncompleteHabitService(habitCompletionAdapter)
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
  async function toggleCompletion(habitId: string, date: string, status: Status){
    isLoading.value = true 
    error.value = null
    var curService;
    //merge complete and uncomplete Services to one to set a status?
    if (status === 'erledigt'){
      curService = completeHabitService
    } else if(status === 'nicht_erledigt'){
      curService = uncompleteHabitService
    } else {
      throw new Error("uncorrect status in toggleCompletion")
      return
    }
    
    try {
      await curService.execute(habitId, date)
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
      habitsCompletionsToday.value = await getCompletionsForDayService.execute(date)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
    } finally {
      isLoading.value = false
    }
  }

  // Setzt das Habit das bearbeitet werden soll (vor Navigation zu HabitEditView)
  function setHabitToEdit(habit: Habit) { habitToEdit.value = habit }
  function clearHabitToEdit() { habitToEdit.value = null }
  function setHabits(newHabits: Habit[]) { habits.value = newHabits }

  return {
    habits, habitsCompletionsToday,
    isLoading, error, habitToEdit,
    completedHabitIds, hiddenHabitIds,
    loadHabit, loadAllHabits, createHabit,
    updateHabit, deleteHabit,
    toggleCompletion, loadCompletionsForToday,
    setHabitToEdit, clearHabitToEdit, setHabits
  }
})
