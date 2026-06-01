<script setup lang="ts">
import { onMounted } from 'vue'
import { useHabitStore } from '@/presentation/stores/habitStore'
import { Habit, incrementStreak } from '@/domain/models/Habit'

const habitStore = useHabitStore()

onMounted(() => {
  const demoHabit: Habit = {
    id: '1',
    userId: 'user-123',
    title: '30 Min. für SE1 lernen 🚀',
    streakCount: 2,
    createdAt: new Date()
  }
  
  const updated = incrementStreak(demoHabit)
  habitStore.setHabits([updated])
})
</script>

<template>
  <div class="skeleton-container">
    <h1>HabitTracker-System (C1) — Walking Skeleton</h1>
    <p>Status: <span class="badge">Lauffähig & Hexagonal konfiguriert</span></p>
    
    <div class="habit-preview" v-for="h in habitStore.habits" :key="h.id">
      <h3>{{ h.title }}</h3>
      <p>Aktueller Streak: 🔥 {{ h.streakCount }} Tage</p>
    </div>
  </div>
</template>

<style scoped>
.skeleton-container {
  font-family: sans-serif;
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 12px;
  background: #1e1e24;
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}
.badge {
  background: #42b883;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}
.habit-preview {
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  color: #333;
  border-radius: 8px;
}
</style>