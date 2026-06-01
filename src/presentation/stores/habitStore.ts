import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Habit } from '@/domain/models/Habit'

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([])
  const isLoading = ref<boolean>(false)

  function setHabits(newHabits: Habit[]) {
    habits.value = newHabits
  }

  return {
    habits,
    isLoading,
    setHabits
  }
})