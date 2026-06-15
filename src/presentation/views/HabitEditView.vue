<script setup lang="ts">
import { ref, onMounted } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'

// Event zum Wechseln zurück zur HomeView
const emit = defineEmits<{
  changeView: [view: string]
}>()

const habitStore = useHabitStore()

// Titel vorausfüllen mit dem ausgewählten Habit aus dem Store
const editTitle = ref(habitStore.habitToEdit?.title ?? '')

onMounted(() => {
  // Falls kein Habit ausgewählt wurde, zurück zur Home-View
  if (!habitStore.habitToEdit) {
    emit('changeView', 'home')
  }
})

// Änderungen speichern und zurück zur HomeView navigieren
async function handleUpdate() {
  if (!habitStore.habitToEdit || !editTitle.value.trim()) return
  await habitStore.updateHabit(habitStore.habitToEdit.id, editTitle.value)
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

    <!-- Formular mit vorausgefülltem Namen -->
    <section class="app-card">
      <form class="app-form">
        <label class="app-label">
          {{ labels.habitCreate.habitLabel }}
          <input
            v-model="editTitle"
            class="app-input"
            :placeholder="labels.habitCreate.namePlaceholder"
          />
        </label>

        <button
          class="app-create-button"
          type="button"
          @click="handleUpdate"
          :disabled="habitStore.isLoading"
        >
          {{ habitStore.isLoading ? 'Speichern...' : 'Änderungen speichern' }}
        </button>

        <p v-if="habitStore.error" style="color: #b00020; font-size: 13px; margin-top: 8px;">
          {{ habitStore.error }}
        </p>
      </form>
    </section>
  </main>
</template>
