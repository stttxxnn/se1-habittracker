<script setup lang="ts">
import { onMounted, ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'

// Event zum Wechseln zurück zur HomeView
const emit = defineEmits<{
  changeView: [view: string]
}>()

const habitStore = useHabitStore()

// IDs der zum Löschen ausgewählten Habits
const selectedIds = ref<Set<string>>(new Set())

// Beim Laden der View alle Habits aus Supabase holen
onMounted(async () => {
  await habitStore.loadAllHabits()
})

// Auswahl eines Habits umschalten
function toggleSelect(id: string) {
  const updated = new Set(selectedIds.value)

  if (updated.has(id)) {
    updated.delete(id)
  } else {
    updated.add(id)
  }

  selectedIds.value = updated
}

// Prüft, ob ein Habit ausgewählt ist
function isSelected(id: string): boolean {
  return selectedIds.value.has(id)
}

// Ausgewählte Habits löschen und zurück zur HomeView navigieren
async function handleDelete() {
  if (selectedIds.value.size === 0) return

  // Kopie der IDs, da deleteHabit die Habit-Liste verändert
  const idsToDelete = Array.from(selectedIds.value)

  for (const id of idsToDelete) {
    await habitStore.deleteHabit(id)

    // Bei einem Fehler abbrechen, damit der Nutzer ihn sieht
    if (habitStore.error) return
  }

  selectedIds.value = new Set()
  emit('changeView', 'home')
}
</script>

<template>
  <main class="app-screen">
    <!-- Seitenkopf mit Zurück-Button -->
    <header class="app-page-header">
      <button class="app-back-button" type="button" @click="$emit('changeView', 'home')">
        ←
      </button>

      <h1 class="app-page-title">{{ labels.habitDelete.title }}</h1>
    </header>

    <!-- Umschalter zwischen Habit und Vice; aktuell ist Habit aktiv -->
    <div class="app-tabs">
      <button class="app-tab active" type="button">
        {{ labels.habitDelete.habitTab }}
      </button>

      <button class="app-tab" type="button">
        {{ labels.habitDelete.viceTab }}
      </button>
    </div>

    <!-- Liste der Habits mit Auswahl-Checkboxen -->
    <section class="app-card">
      <h2 class="app-section-title">{{ labels.habitDelete.habitsLabel }}</h2>

      <p v-if="habitStore.isLoading" class="delete-status">
        Loading habits...
      </p>

      <p v-else-if="habitStore.error" class="delete-error">
        {{ habitStore.error }}
      </p>

      <p v-else-if="habitStore.habits.length === 0" class="delete-status">
        {{ labels.habitDelete.empty }}
      </p>

      <ul v-else class="delete-list">
        <li
          v-for="habit in habitStore.habits"
          :key="habit.id"
          class="delete-list-item"
        >
          <span class="delete-habit-name">{{ habit.title }}</span>

          <input
            type="checkbox"
            class="delete-checkbox"
            :checked="isSelected(habit.id)"
            :aria-label="habit.title"
            @change="toggleSelect(habit.id)"
          />
        </li>
      </ul>
    </section>

    <!-- Roter Lösch-Button am unteren Rand wie im Wireframe -->
    <button
      class="delete-button"
      type="button"
      :disabled="selectedIds.size === 0 || habitStore.isLoading"
      @click="handleDelete"
    >
      {{ habitStore.isLoading ? labels.habitDelete.deleting : labels.habitDelete.delete }}
    </button>
  </main>
</template>

<style scoped>
/* Liste der löschbaren Habits */
.delete-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.delete-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.delete-habit-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f1f1f;
}

.delete-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #7437d8;
  cursor: pointer;
}

.delete-status,
.delete-error {
  margin: 0;
  font-size: 13px;
}

.delete-error {
  color: #b00020;
}

/* Roter Lösch-Button */
.delete-button {
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: #d9534f;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
