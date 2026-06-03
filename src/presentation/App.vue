<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHabitStore } from './stores/habitStore';
import { Habit } from '@/domain/models/Habit';
import { SupabaseHabitAdapter } from '../infrastructure/Adapter/SupabaseHabitAdapter';
import { GetHabitService } from '../domain/Services/GetHabitService';

const habit = ref<Habit | null>(null)
const loading = ref(true)
const error = ref<string | null>(null);

const habitAdapter = new SupabaseHabitAdapter()
const habitService = new GetHabitService(habitAdapter)

const habitStore = useHabitStore()

onMounted(() => {
  const demoHabit: Habit = {
    id: '1',
    //userId: 'user-123',
    title: '30 Min. für SE1 lernen 🚀',
    //streakCount: 2,
    createdAt: new Date()
  }

  //const updated = incrementStreak(demoHabit)
  habitStore.setHabits([demoHabit])
})

onMounted(async () => {
  try {
    // Nutzt hier genau die Test-ID, die ihr vorhin per SQL in die DB eingefügt habt!
    const testId = '11111111-2222-3333-4444-555555555555'

    // Der Service wird aufgerufen (er validiert, nutzt den Port, triggert den Adapter)
    habit.value = await habitService.execute(testId)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="skeleton-container">
    <h1>HabitTracker-System (C1) — Walking Skeleton</h1>
    <p>Status: <span class="badge">Lauffähig & Hexagonal konfiguriert</span></p>

    <div class="habit-preview" v-for="h in habitStore.habits" :key="h.id">
      <h3>{{ h.title }}</h3>
    </div>
    <div v-if="loading">Lädt Daten aus Supabase...</div>

    <div v-else-if="error" class="error-box">
      ⚠️ Fehler: {{ error }}
    </div>

    <div v-else-if="habit" class="habit-card">
      <h2>🎉 Verbindung steht!</h2>
      <p><strong>ID:</strong> {{ habit.id }}</p>
      <p><strong>Titel:</strong> {{ habit.title }}</p>
      <p><strong>Erstellt am:</strong> {{ habit.createdAt.toLocaleDateString() }}</p>
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
