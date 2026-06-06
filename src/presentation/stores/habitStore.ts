import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Habit } from '@/domain/models/Habit'
import { SupabaseHabitAdapter } from '@/infrastructure/Adapter/SupabaseHabitAdapter'
import { GetHabitService } from '@/domain/Services/GetHabitService'

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  let habitAdapter = new SupabaseHabitAdapter()
  let habitService = new GetHabitService(habitAdapter)

  function setAdapter(customAdapter: any) {
    habitAdapter = customAdapter
    habitService = new GetHabitService(customAdapter)
  }

  async function loadHabit(id: string) {
    isLoading.value = true
    error.value = null

    try {
      const habit = await habitService.execute(id)
      habits.value = [habit]
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Unknown error while loading habit'
      }
    } finally {
      isLoading.value = false
    }
  }

  function setHabits(newHabits: Habit[]) {
    habits.value = newHabits
  }

  return {
    habits,
    isLoading,
    error,
    loadHabit,
    setHabits,
    setAdapter
  }
})
