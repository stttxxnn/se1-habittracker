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

// Steuert die Sicherheitsabfrage vor dem endgültigen Löschen
const showConfirm = ref<boolean>(false)

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

// Öffnet die Sicherheitsabfrage (statt direkt zu löschen)
function requestDelete() {
  if (selectedIds.value.size === 0) return
  showConfirm.value = true
}

// Bricht die Sicherheitsabfrage ab, Auswahl bleibt erhalten
function cancelDelete() {
  showConfirm.value = false
}

// Endgültiges Löschen nach Bestätigung; danach zurück zur HomeView
async function confirmDelete() {
  // Kopie der IDs, da deleteHabit die Habit-Liste verändert
  const idsToDelete = Array.from(selectedIds.value)

  for (const id of idsToDelete) {
    await habitStore.deleteHabit(id)

    // Bei einem Fehler abbrechen, damit der Nutzer ihn sieht
    if (habitStore.error) {
      showConfirm.value = false
      return
    }
  }

  selectedIds.value = new Set()
  showConfirm.value = false
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
      @click="requestDelete"
    >
      {{ habitStore.isLoading ? labels.habitDelete.deleting : labels.habitDelete.delete }}
    </button>

    <!-- Sicherheitsabfrage vor dem endgültigen Löschen -->
    <div v-if="showConfirm" class="confirm-overlay" @click.self="cancelDelete">
      <div class="confirm-dialog" role="dialog" aria-modal="true">
        <h2 class="confirm-title">{{ labels.habitDelete.confirmTitle }}</h2>

        <p class="confirm-text">
          {{ selectedIds.size }} {{ labels.habitDelete.confirmText }}
        </p>

        <div class="confirm-actions">
          <button class="confirm-cancel" type="button" @click="cancelDelete">
            {{ labels.habitDelete.confirmNo }}
          </button>

          <button
            class="confirm-delete"
            type="button"
            :disabled="habitStore.isLoading"
            @click="confirmDelete"
          >
            {{ habitStore.isLoading ? labels.habitDelete.deleting : labels.habitDelete.confirmYes }}
          </button>
        </div>
      </div>
    </div>
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

/* Overlay der Sicherheitsabfrage */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 100;
}

.confirm-dialog {
  width: 100%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 16px;
  padding: 22px 20px;
  text-align: center;
}

.confirm-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
}

.confirm-text {
  margin: 0 0 20px;
  font-size: 14px;
  color: #555555;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.confirm-cancel,
.confirm-delete {
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-cancel {
  background: #e7e7e7;
  color: #1f1f1f;
}

.confirm-delete {
  background: #d9534f;
  color: #ffffff;
}

.confirm-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
