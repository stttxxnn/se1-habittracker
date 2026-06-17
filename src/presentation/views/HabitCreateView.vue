<script setup lang="ts">
import { ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'

// Event zum Wechseln zurück zur HomeView
const emit = defineEmits<{
  changeView: [view: string]
}>()

const habitStore = useHabitStore()

// Eingabefeld für den Habit-Namen
const newTitle = ref('')

// Temporäre Werte für den Slider im Wireframe
const minGoal = 7
const maxGoal = 31
const goal = ref(14)

// Habit speichern und zurück zur HomeView navigieren
async function handleCreate() {
  if (!newTitle.value.trim()) return
  await habitStore.createHabit(newTitle.value)
  if (!habitStore.error) {
    emit('changeView', 'home')
  }
}
</script>

<template>
  <main class="app-screen">
    <!-- Seitenkopf mit Zurück-Button -->
    <header class="app-page-header">
      <button class="app-back-button" type="button" @click="$emit('changeView', 'home')">
        ←
      </button>

      <h1 class="app-page-title">{{ labels.habitCreate.title }}</h1>
    </header>

    <!-- Umschalter zwischen Habit und Vice; aktuell ist Habit aktiv -->
    <div class="app-tabs">
      <button class="app-tab active" type="button">
        {{ labels.habitCreate.habitTab }}
      </button>

      <button class="app-tab" type="button">
        {{ labels.habitCreate.viceTab }}
      </button>
    </div>

    <!-- Formular-Skeleton für die spätere Habit-Erstellung -->
    <section class="app-card">
      <form class="app-form">
        <label class="app-label">
          {{ labels.habitCreate.habitLabel }}
          <input
            v-model="newTitle"
            class="app-input"
            :placeholder="labels.habitCreate.namePlaceholder"
          />
        </label>

        <div class="app-form-row">
          <label class="app-label">
            {{ labels.habitCreate.iconLabel }}
            <button class="app-small-button" type="button">
              {{ labels.habitCreate.chooseIcon }}
            </button>
          </label>

          <label class="app-label">
            {{ labels.habitCreate.colorLabel }}
            <button class="app-small-button" type="button">
              {{ labels.habitCreate.chooseColor }}
            </button>
          </label>
        </div>

        <label class="app-label">
          {{ labels.habitCreate.periodicityLabel }}
          <select class="app-select">
            <option>{{ labels.habitCreate.periodicityPlaceholder }}</option>
          </select>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.executionLabel }}
          <select class="app-select">
            <option>{{ labels.habitCreate.executionPlaceholder }}</option>
          </select>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.durationLabel }}
          <select class="app-select">
            <option>{{ labels.habitCreate.durationPlaceholder }}</option>
          </select>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.reasonLabel }}
          <input
            class="app-input"
            :placeholder="labels.habitCreate.reasonPlaceholder"
          />
        </label>

        <label class="app-label">
          {{ labels.habitCreate.bindingLabel }}
          <select class="app-select">
            <option>{{ labels.habitCreate.bindingPlaceholder }}</option>
          </select>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.locationLabel }}
          <select class="app-select">
            <option>{{ labels.habitCreate.locationPlaceholder }}</option>
          </select>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.difficultyLabel }}
          <select class="app-select">
            <option>{{ labels.habitCreate.difficultyPlaceholder }}</option>
          </select>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.notesLabel }}
          <textarea class="app-textarea"></textarea>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.firstGoalLabel }}

          <div class="goal-labels">
            <span>{{ minGoal }} {{ labels.habitCreate.repetitions }}</span>
            <span>{{ maxGoal }} {{ labels.habitCreate.repetitions }}</span>
          </div>

          <input
            v-model="goal"
            class="goal-range"
            type="range"
            :min="minGoal"
            :max="maxGoal"
          />
        </label>

        <button class="app-create-button" type="button" @click="handleCreate" :disabled="habitStore.isLoading">
          {{ habitStore.isLoading ? 'Speichern...' : labels.habitCreate.create }}
        </button>

        <p v-if="habitStore.error" style="color: #b00020; font-size: 13px; margin-top: 8px;">
          {{ habitStore.error }}
        </p>
      </form>
    </section>
  </main>
</template>

<style scoped>
/* Beschriftungen links und rechts am Slider */
.goal-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #555555;
}

/* Individuelles Styling für den Ziel-Slider */
.goal-range {
  padding: 0;
  accent-color: #7b4dff;
}
</style>