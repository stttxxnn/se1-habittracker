<script setup lang="ts">
import { computed, ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'

// Verfügbare Icon-Schlüssel mit temporärer Emoji-Darstellung.
// Die Symbole können später durch SVG-Komponenten ersetzt werden.
const iconOptions = [
  { value: 'reading', symbol: '📖' },
  { value: 'water', symbol: '💧' },
  { value: 'sport', symbol: '🏃' },
  { value: 'strength', symbol: '🏋' },
  { value: 'language', symbol: '🗣' },
  { value: 'study', symbol: '🎓' },
  { value: 'work', symbol: '💼' },
  { value: 'health', symbol: '❤' },
  { value: 'mindfulness', symbol: '🪷' },
  { value: 'meditation', symbol: '🧘' },
  { value: 'journal', symbol: '✍' },
  { value: 'coldShower', symbol: '🚿' },
  { value: 'sleep', symbol: '🌙' },
  { value: 'walking', symbol: '🚶' },
  { value: 'nutrition', symbol: '🥗' },
  { value: 'focus', symbol: '🎯' },
  { value: 'music', symbol: '🎵' },
  { value: 'creativity', symbol: '🎨' },
  { value: 'cleaning', symbol: '🧹' },
  { value: 'finance', symbol: '💰' }
] as const

// Leitet die erlaubten Icon-Werte direkt aus den verfügbaren Optionen ab
type HabitIcon =
  (typeof iconOptions)[number]['value']

// Vordefinierte Farbpalette für eine einheitliche Darstellung im Dashboard
const colorOptions = [
  { name: labels.habitCreate.colors.red, value: '#e6194b' },
  { name: labels.habitCreate.colors.green, value: '#3cb44b' },
  { name: labels.habitCreate.colors.yellow, value: '#f1c40f' },
  { name: labels.habitCreate.colors.blue, value: '#4363d8' },
  { name: labels.habitCreate.colors.orange, value: '#f58231' },
  { name: labels.habitCreate.colors.purple, value: '#911eb4' },
  { name: labels.habitCreate.colors.cyan, value: '#00a6d6' },
  { name: labels.habitCreate.colors.magenta, value: '#e600a9' },
  { name: labels.habitCreate.colors.lime, value: '#7cb518' },
  { name: labels.habitCreate.colors.teal, value: '#008080' },
  { name: labels.habitCreate.colors.brown, value: '#9a6324' },
  { name: labels.habitCreate.colors.navy, value: '#000075' }
]

// Beschreibt die Daten, mit denen eine Habit-Vorlage das Formular vorausfüllt
type HabitTemplate = {
  title: string
  icon: HabitIcon
  color: string
  periodicity: 'daily' | 'weekly' | 'monthly'
  weekdays: string[]
  time: string
  duration: number
  reason: string
  difficulty: number
}

// Temporäre Frontend-Vorlagen; werden nach Umsetzung von Issue #69
// durch den Import aus src/domain/data/habitTemplates.ts ersetzt
const habitTemplates: HabitTemplate[] = [
  {
    title: 'Read in the morning',
    icon: 'reading',
    color: '#4363d8',
    periodicity: 'daily',
    weekdays: [],
    time: '07:00',
    duration: 20,
    reason: 'Start the day calmly',
    difficulty: 2
  },
  {
    title: 'Drink enough water',
    icon: 'water',
    color: '#00a6d6',
    periodicity: 'daily',
    weekdays: [],
    time: '09:00',
    duration: 5,
    reason: 'Stay hydrated',
    difficulty: 1
  },
  {
    title: 'Exercise',
    icon: 'sport',
    color: '#3cb44b',
    periodicity: 'weekly',
    weekdays: ['monday', 'wednesday', 'friday'],
    time: '18:00',
    duration: 60,
    reason: 'Improve my fitness',
    difficulty: 4
  },
  {
    title: 'Meditate',
    icon: 'meditation',
    color: '#911eb4',
    periodicity: 'daily',
    weekdays: [],
    time: '07:30',
    duration: 10,
    reason: 'Reduce stress',
    difficulty: 2
  },
  {
    title: 'Write a journal',
    icon: 'journal',
    color: '#f58231',
    periodicity: 'daily',
    weekdays: [],
    time: '21:00',
    duration: 15,
    reason: 'Reflect on my day',
    difficulty: 2
  },
  {
    title: 'Learn vocabulary',
    icon: 'language',
    color: '#e600a9',
    periodicity: 'daily',
    weekdays: [],
    time: '17:00',
    duration: 20,
    reason: 'Improve my language skills',
    difficulty: 3
  },
  {
    title: 'Take a cold shower',
    icon: 'coldShower',
    color: '#008080',
    periodicity: 'daily',
    weekdays: [],
    time: '07:15',
    duration: 5,
    reason: 'Feel more energetic',
    difficulty: 4
  },
  {
    title: 'Go to bed early',
    icon: 'sleep',
    color: '#000075',
    periodicity: 'daily',
    weekdays: [],
    time: '22:30',
    duration: 30,
    reason: 'Improve my sleep schedule',
    difficulty: 3
  }
]

// Event zum Wechseln zurück zur HomeView
const emit = defineEmits<{
  changeView: [view: string]
}>()

const habitStore = useHabitStore()

// Lokaler Formularzustand für die vom Nutzer eingegebenen Habit-Daten
const newTitle = ref('')
const selectedPeriodicity = ref('')
const selectedWeekdays = ref<string[]>([])
const selectedTime = ref('')
const duration = ref<number | ''>('')
const difficulty = ref<number | ''>('')
const selectedIcon = ref<HabitIcon | ''>('')
const selectedColor = ref('')
const reason = ref('')

// Referenz zum Öffnen und Schließen des Vorlagen-Dialogs
const templateDialog = ref<HTMLDialogElement | null>(null)

// Name der ausgewählten Vorlage für die Anzeige im Auswahl-Button
const selectedTemplateTitle = ref('')

// Referenz zum Öffnen und Schließen des Icon-Dialogs
const iconDialog = ref<HTMLDialogElement | null>(null)

// Referenz zum Öffnen und Schließen des Farb-Dialogs
const colorDialog = ref<HTMLDialogElement | null>(null)

// Ermittelt das ausgewählte Icon für die Anzeige im Auswahl-Button
const selectedIconOption = computed(() => {
  return iconOptions.find(
    icon => icon.value === selectedIcon.value
  )
})

// Enthält die Inline-Fehlermeldungen der clientseitigen Formularprüfung
const validationErrors = ref({
  name: '',
  periodicity: '',
  weekdays: '',
  duration: ''
})

function clearValidationErrors() {
  validationErrors.value = {
    name: '',
    periodicity: '',
    weekdays: '',
    duration: ''
  }
}

// Prüft alle relevanten Eingaben, bevor Daten an den Store weitergegeben werden
function validateForm(): boolean {
  clearValidationErrors()

  if (!newTitle.value.trim()) {
    validationErrors.value.name =
      labels.habitCreate.validation.nameRequired
  }

  if (!selectedPeriodicity.value) {
    validationErrors.value.periodicity =
      labels.habitCreate.validation.periodicityRequired
  }

  // Bei einer wöchentlichen Gewohnheit muss mindestens ein Wochentag gewählt sein
  if (
    selectedPeriodicity.value === 'weekly' &&
    selectedWeekdays.value.length === 0
  ) {
    validationErrors.value.weekdays =
      labels.habitCreate.validation.weekdayRequired
  }

  // Eine optionale Dauer muss eine positive Zahl sein
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

// Überträgt die Werte einer Vorlage in den lokalen Formularzustand
function applyTemplate(template: HabitTemplate) {
  selectedTemplateTitle.value = template.title
  newTitle.value = template.title
  selectedIcon.value = template.icon
  selectedColor.value = template.color
  selectedPeriodicity.value = template.periodicity
  selectedWeekdays.value = [...template.weekdays]
  selectedTime.value = template.time
  duration.value = template.duration
  reason.value = template.reason
  difficulty.value = template.difficulty

  clearValidationErrors()
  templateDialog.value?.close()
}

// Validiert das Formular, erstellt das Habit und öffnet anschließend die HomeView
async function handleCreate() {
  if (!validateForm()) return

  await habitStore.createHabit({
    title: newTitle.value.trim(),
    periodicity: selectedPeriodicity.value || undefined,
    weekdays: selectedPeriodicity.value === 'weekly' && selectedWeekdays.value.length
      ? selectedWeekdays.value
      : undefined,
    scheduledTime: selectedTime.value || undefined,
    duration: typeof duration.value === 'number' ? duration.value : undefined,
    color: selectedColor.value || undefined,
    icon: selectedIcon.value || undefined,
    reason: reason.value.trim() || undefined
  })

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

      <button class="app-tab" type="button" disabled>
        {{ labels.habitCreate.viceTab }}
      </button>
    </div>

    <!-- Optionale Auswahl einer vordefinierten Habit-Vorlage -->
    <section class="app-card">
      <div class="app-label">
        <span>
          {{ labels.habitCreate.templateLabel }}
        </span>

        <button
          class="template-open-button"
          type="button"
          @click="templateDialog?.showModal()"
        >
          {{ selectedTemplateTitle ||
            labels.habitCreate.chooseTemplate }}
        </button>
      </div>
    </section>

    <!-- Formular für die manuelle Erstellung und Bearbeitung der vorausgefüllten Werte -->
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

            <button
              class="icon-picker-button"
              type="button"
              @click="iconDialog?.showModal()"
            >
              <span v-if="selectedIconOption" class="selected-icon">
                {{ selectedIconOption.symbol }}
              </span>

              <span v-else>
                {{ labels.habitCreate.iconPlaceholder }}
              </span>
            </button>
          </label>
          
          <label class="app-label">
            {{ labels.habitCreate.colorLabel }}

            <button
              class="color-picker-button"
              type="button"
              @click="colorDialog?.showModal()"
            >
              <span
                v-if="selectedColor"
                class="selected-color-swatch"
                :style="{ backgroundColor: selectedColor }"
              ></span>

              <span v-else>
                {{ labels.habitCreate.chooseColor }}
              </span>
            </button>
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
        
        <!-- Wochentage werden nur bei wöchentlicher Periodizität angezeigt -->
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
            v-model="reason"
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

    <!-- Dialog mit den verfügbaren Habit-Vorlagen -->
    <dialog ref="templateDialog" class="template-dialog">
      <header class="template-dialog-header">
        <h2>{{ labels.habitCreate.templateModalTitle }}</h2>

        <button
          type="button"
          class="template-close-button"
          @click="templateDialog?.close()"
        >
          &times;
        </button>
      </header>

      <div class="template-list">
        <button
          v-for="template in habitTemplates"
          :key="template.title"
          type="button"
          class="template-list-item"
          @click="applyTemplate(template)"
        >
          {{ template.title }}
        </button>
      </div>
    </dialog>

    <!-- Dialog mit den verfügbaren Habit-Icons -->
    <dialog ref="iconDialog" class="icon-dialog">
      <header class="icon-dialog-header">
        <h2>{{ labels.habitCreate.iconPlaceholder }}</h2>

        <button
          class="icon-dialog-close"
          type="button"
          @click="iconDialog?.close()"
        >
          &times;
        </button>
      </header>

      <div class="icon-options">
        <button
          v-for="icon in iconOptions"
          :key="icon.value"
          class="icon-option"
          :class="{ selected: selectedIcon === icon.value }"
          type="button"
          :title="labels.habitCreate.icons[icon.value]"
          :aria-label="labels.habitCreate.icons[icon.value]"
          @click="
            selectedIcon = icon.value;
            iconDialog?.close()
          "
        >
          <span aria-hidden="true">{{ icon.symbol }}</span>
        </button>
      </div>
    </dialog>

    <!-- Dialog mit der begrenzten Farbauswahl -->
    <dialog ref="colorDialog" class="color-dialog">
      <header class="color-dialog-header">
        <h2>{{ labels.habitCreate.chooseColor }}</h2>

        <button
          class="color-dialog-close"
          type="button"
          @click="colorDialog?.close()"
        >
          &times;
        </button>
      </header>

      <div class="color-options">
        <label
          v-for="color in colorOptions"
          :key="color.value"
          class="color-option"
          :title="color.name"
        >
          <input
            v-model="selectedColor"
            class="color-radio"
            type="radio"
            name="habit-color"
            :value="color.value"
            :aria-label="color.name"
            @change="colorDialog?.close()"
          />

          <span
            class="color-swatch"
            :style="{ backgroundColor: color.value }"
            aria-hidden="true"
          ></span>
        </label>
      </div>
    </dialog>



  </main>
</template>

<style scoped>
/* Interaktive Formularelemente */
.app-select,
.color-option,
.weekday-option,
.weekday-option input,
.app-input[type='time'] {
  cursor: pointer;
}

.app-create-button:disabled {
  cursor: not-allowed;
}

/* Validierungszustände */

.input-error {
  border-color: #b00020;
}

.field-error {
  color: #b00020;
  font-size: 12px;
}

/* Gemeinsame Auswahlfelder für Icon und Farbe */

.icon-picker-button,
.color-picker-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 46px;
  padding: 6px 12px;
  border: 1px solid #cccccc;
  border-radius: 20px;
  background: #ffffff;
  color: #1f1f1f;
  text-align: center;
}

.selected-icon {
  display: inline-grid;
  flex: 0 0 24px;
  place-items: center;
  width: 24px;
  height: 24px;
  font-size: 20px;
  line-height: 1;
}

.selected-color-swatch {
  width: 24px;
  height: 24px;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 50%;
}

/* Auswahl der Wochentage */

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

/* Gemeinsame Grundgestaltung aller Dialoge */
.template-dialog,
.color-dialog,
.icon-dialog {
  width: min(342px, calc(100% - 32px));
  padding: 16px;
  border: 0;
  border-radius: 14px;
}

.template-dialog::backdrop,
.color-dialog::backdrop,
.icon-dialog::backdrop {
  background: rgb(0 0 0 / 40%);
}

/* Gemeinsame Dialog-Kopfzeilen */
.template-dialog-header,
.icon-dialog-header,
.color-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-dialog-header h2,
.icon-dialog-header h2,
.color-dialog-header h2 {
  margin: 0;
  font-size: 18px;
}

.template-close-button,
.icon-dialog-close,
.color-dialog-close {
  border: 0;
  background: transparent;
  font-size: 24px;
}

/* Auswahl der Habit-Vorlage */
.template-open-button {
  width: 100%;
  padding: 12px;
  border: 1px solid #cccccc;
  border-radius: 20px;
  background: #ffffff;
  text-align: left;
}

.template-list {
  display: grid;
  gap: 8px;
  max-height: 55vh;
  margin-top: 14px;
  overflow-y: auto;
}

.template-list-item {
  padding: 12px;
  border: 1px solid #dddddd;
  border-radius: 10px;
  background: #f5f5f5;
  text-align: left;
}

/* Icon-Auswahl */
.icon-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 16px;
}

.icon-option {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 1px solid #dddddd;
  border-radius: 10px;
  background: #ffffff;
  font-size: 24px;
}

.icon-option.selected {
  border-color: #7b4dff;
  outline: 2px solid #7b4dff;
}

/* Farbauswahl */
.color-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.color-option {
  position: relative;
  display: grid;
  place-items: center;
}

.color-radio {
  position: absolute;
  opacity: 0;
}

.color-swatch {
  width: 38px;
  height: 38px;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 50%;
}

.color-radio:checked + .color-swatch {
  outline: 3px solid #1f1f1f;
  outline-offset: 2px;
}
</style>