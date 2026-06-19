import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Habit } from '@/domain/models/Habit'
import { SupabaseHabitAdapter } from '@/infrastructure/Adapter/SupabaseHabitAdapter'
import { GetHabitService } from '@/domain/Services/GetHabitService'
import { GetAllHabitsService } from '@/domain/Services/GetAllHabitsService'
import { CreateHabitService } from '@/domain/Services/CreateHabitService'
import { UpdateHabitService } from '@/domain/Services/UpdateHabitService'
import { DeleteHabitService } from '@/domain/Services/DeleteHabitService'

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const habitToEdit = ref<Habit | null>(null)

  const habitAdapter = new SupabaseHabitAdapter()
  const getHabitService = new GetHabitService(habitAdapter)
  const getAllHabitsService = new GetAllHabitsService(habitAdapter)
  const createHabitService = new CreateHabitService(habitAdapter)
  const updateHabitService = new UpdateHabitService(habitAdapter)
  const deleteHabitService = new DeleteHabitService(habitAdapter)

  async function loadHabit(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const habit = await getHabitService.execute(id)
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
      habits.value = await getAllHabitsService.execute()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
    } finally {
      isLoading.value = false
    }
  }

  async function createHabit(
    title: string,
    options?: {
      periodicity?: string
      weekdays?: string[]
      scheduledTime?: string
      duration?: number
      color?: string
    }
  ) {
    isLoading.value = true
    error.value = null
    try {
      const newHabit = await createHabitService.execute(title, options)
      habits.value.unshift(newHabit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Erstellen'
    } finally {
      isLoading.value = false
    }
  }

  async function updateHabit(id: string, title: string) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await updateHabitService.execute(id, title)
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
      await deleteHabitService.execute(id)
      habits.value = habits.value.filter(h => h.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen'
    } finally {
      isLoading.value = false
    }
  }

  function setHabitToEdit(habit: Habit) { habitToEdit.value = habit }
  function setHabits(newHabits: Habit[]) { habits.value = newHabits }
  function setAdapter(_customAdapter: any) {}

  return {
    habits, isLoading, error, habitToEdit,
    loadHabit, loadAllHabits, createHabit,
    updateHabit, deleteHabit, setHabitToEdit, setHabits, setAdapter
  }
})
