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

const selectedPeriodicity = ref('')

const selectedWeekdays = ref<string[]>([])
const selectedTime = ref('')
const duration = ref<number | ''>('')
const difficulty = ref<number | ''>('')

const validationErrors = ref({
  name: '',
  periodicity: '',
  weekdays: '',
  duration: ''
})

function validateForm(): boolean {
  validationErrors.value = {
    name: '',
    periodicity: '',
    weekdays: '',
    duration: ''
  }

  if (!newTitle.value.trim()) {
    validationErrors.value.name =
      labels.habitCreate.validation.nameRequired
  }

  if (!selectedPeriodicity.value) {
    validationErrors.value.periodicity =
      labels.habitCreate.validation.periodicityRequired
  }

  if (
    selectedPeriodicity.value === 'weekly' &&
    selectedWeekdays.value.length === 0
  ) {
    validationErrors.value.weekdays =
      labels.habitCreate.validation.weekdayRequired
  }

  if (
    duration.value !== '' &&
    (!Number.isFinite(duration.value) || duration.value <= 0)
  ) {
    validationErrors.value.duration =
      labels.habitCreate.validation.durationInvalid
  }

  return Object.values(validationErrors.value)
    .every(error => error === '')
}


// Habit speichern und zurück zur HomeView navigieren
async function handleCreate() {
  if (!validateForm()) return

  await habitStore.createHabit(newTitle.value.trim())

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
      <form class="app-form" novalidate @submit.prevent="handleCreate">

        <label class="app-label">
          {{ labels.habitCreate.habitLabel }}

          <input
            v-model="newTitle"
            class="app-input"
            :class="{ 'input-error': validationErrors.name }"
            :aria-invalid="Boolean(validationErrors.name)"
            :placeholder="labels.habitCreate.namePlaceholder"
          />

          <span v-if="validationErrors.name" class="field-error">
            {{ validationErrors.name }}
          </span>
        </label>

        <div class="app-form-row">
        <label class="app-label">
          {{ labels.habitCreate.iconLabel }}

          <select class="app-select">
            <option value="" disabled selected>
              {{ labels.habitCreate.iconPlaceholder }}
            </option>
            <option value="book">{{ labels.habitCreate.icons.book }}</option>
            <option value="sport">{{ labels.habitCreate.icons.sport }}</option>
            <option value="language">{{ labels.habitCreate.icons.language }}</option>
            <option value="health">{{ labels.habitCreate.icons.health }}</option>
            <option value="work">{{ labels.habitCreate.icons.work }}</option>
            <option value="study">{{ labels.habitCreate.icons.study }}</option>
            <option value="custom">{{ labels.habitCreate.icons.custom }}</option>
          </select>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.colorLabel }}

          <span class="color-picker">
            <input
              class="color-picker-input"
              type="color"
              name="color"
              value="#7b4dff"
              :aria-label="labels.habitCreate.chooseColor"
            />

            <span>{{ labels.habitCreate.chooseColor }}</span>
          </span>
        </label>
      </div>

        <label class="app-label">
          {{ labels.habitCreate.periodicityLabel }}

          <select
            v-model="selectedPeriodicity"
            class="app-select"
            :class="{ 'input-error': validationErrors.periodicity }"
            :aria-invalid="Boolean(validationErrors.periodicity)"
          >
            <option value="" disabled>
              {{ labels.habitCreate.periodicityPlaceholder }}
            </option>

            <option value="daily">
              {{ labels.habitCreate.periodicities.daily }}
            </option>

            <option value="weekly">
              {{ labels.habitCreate.periodicities.weekly }}
            </option>

            <option value="monthly">
              {{ labels.habitCreate.periodicities.monthly }}
            </option>
          </select>
          <span v-if="validationErrors.periodicity" class="field-error">
            {{ validationErrors.periodicity }}
          </span>
        </label>
        
        <fieldset
          v-if="selectedPeriodicity === 'weekly'"
          class="weekday-fieldset"
        >
          <legend>{{ labels.habitCreate.weekdaysLabel }}</legend>

          <label class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              value="monday"
            />
            {{ labels.habitCreate.weekdays.monday }}
          </label>

          <label class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              value="tuesday"
            />
            {{ labels.habitCreate.weekdays.tuesday }}
          </label>

          <label class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              value="wednesday"
            />
            {{ labels.habitCreate.weekdays.wednesday }}
          </label>

          <label class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              value="thursday"
            />
            {{ labels.habitCreate.weekdays.thursday }}
          </label>

          <label class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              value="friday"
            />
            {{ labels.habitCreate.weekdays.friday }}
          </label>

          <label class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              value="saturday"
            />
            {{ labels.habitCreate.weekdays.saturday }}
          </label>

          <label class="weekday-option">
            <input
              v-model="selectedWeekdays"
              type="checkbox"
              value="sunday"
            />
            {{ labels.habitCreate.weekdays.sunday }}
          </label>

          <span v-if="validationErrors.weekdays" class="field-error">
            {{ validationErrors.weekdays }}
          </span>
        </fieldset>


        <label class="app-label">
          {{ labels.habitCreate.timeLabel }}
          <input
            v-model="selectedTime"
            class="app-input"
            type="time"
          />
        </label>

        <label class="app-label">
          {{ labels.habitCreate.durationLabel }}
          <input
            v-model.number="duration"
            class="app-input"
            :placeholder="labels.habitCreate.durationPlaceholder"
            :class="{ 'input-error': validationErrors.duration }"
            type="number"
            min="1"
          />
          <span v-if="validationErrors.duration" class="field-error">
            {{ validationErrors.duration }}
          </span>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.reasonLabel }}
          <textarea
            class="app-textarea"
            :placeholder="labels.habitCreate.reasonPlaceholder"
          ></textarea>
        </label>

        <label class="app-label">
          {{ labels.habitCreate.difficultyLabel }}
          
          <select v-model.number="difficulty" class="app-select">
            <option value="">
              {{ labels.habitCreate.difficultyPlaceholder }}
            </option>
            <option value="1">{{ labels.habitCreate.difficulties.level1 }}</option>
            <option value="2">{{ labels.habitCreate.difficulties.level2 }}</option>
            <option value="3">{{ labels.habitCreate.difficulties.level3 }}</option>
            <option value="4">{{ labels.habitCreate.difficulties.level4 }}</option>
            <option value="5">{{ labels.habitCreate.difficulties.level5 }}</option>
          </select>
        </label>

        <button
          class="app-create-button"
          type="submit"
          :disabled="habitStore.isLoading"
        >
          {{ habitStore.isLoading
            ? labels.habitCreate.saving
            : labels.habitCreate.create }}
        </button>

        <p v-if="habitStore.error" class="field-error">
          {{ habitStore.error }}
        </p>
      </form>
    </section>
  </main>
</template>

<style scoped>
.weekday-fieldset {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
  color: #555555;
  font-size: 12px;
}

.weekday-fieldset legend {
  grid-column: 1 / -1;
  margin-bottom: 6px;
}

.weekday-option {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 6px 10px;
  border: 1px solid #cccccc;
  border-radius: 20px;
  background: #ffffff;
  color: #1f1f1f;
  font-size: 11px;
  cursor: pointer;
}

.color-picker-input {
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.color-picker-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker-input::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}

.color-picker-input::-moz-color-swatch {
  border: none;
  border-radius: 50%;
}

.input-error {
  border-color: #b00020;
}

.field-error {
  color: #b00020;
  font-size: 12px;
}
</style>