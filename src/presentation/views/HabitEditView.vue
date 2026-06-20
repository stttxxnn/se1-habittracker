<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import labels from '@/presentation/locales/en.json'
import { useHabitStore } from '@/presentation/stores/habitStore'
import type { Habit } from '@/domain/models/Habit'

const iconOptions = [
  { value: 'reading', symbol: labels.habitCreate.icons.reading },
  { value: 'water', symbol: labels.habitCreate.icons.water },
  { value: 'sport', symbol: labels.habitCreate.icons.sport },
  { value: 'strength', symbol: labels.habitCreate.icons.strength },
  { value: 'language', symbol: labels.habitCreate.icons.language },
  { value: 'study', symbol: labels.habitCreate.icons.study },
  { value: 'work', symbol: labels.habitCreate.icons.work },
  { value: 'health', symbol: labels.habitCreate.icons.health },
  { value: 'mindfulness', symbol: labels.habitCreate.icons.mindfulness },
  { value: 'meditation', symbol: labels.habitCreate.icons.meditation },
  { value: 'journal', symbol: labels.habitCreate.icons.journal },
  { value: 'coldShower', symbol: labels.habitCreate.icons.coldShower },
  { value: 'sleep', symbol: labels.habitCreate.icons.sleep },
  { value: 'walking', symbol: labels.habitCreate.icons.walking },
  { value: 'nutrition', symbol: labels.habitCreate.icons.nutrition },
  { value: 'focus', symbol: labels.habitCreate.icons.focus },
  { value: 'music', symbol: labels.habitCreate.icons.music },
  { value: 'creativity', symbol: labels.habitCreate.icons.creativity },
  { value: 'cleaning', symbol: labels.habitCreate.icons.cleaning },
  { value: 'finance', symbol: labels.habitCreate.icons.finance }
] as const

type HabitIcon = (typeof iconOptions)[number]['value']

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

const emit = defineEmits<{
  changeView: [view: string]
}>()

const habitStore = useHabitStore()

const selectedHabit = ref<Habit | null>(habitStore.habitToEdit)
const isEditingForm = ref(Boolean(habitStore.habitToEdit))

const editTitle = ref(habitStore.habitToEdit?.title ?? '')
const selectedPeriodicity = ref('')
const selectedWeekdays = ref<string[]>([])
const selectedTime = ref('')
const duration = ref<number | ''>('')
const difficulty = ref<number | ''>('')
const selectedIcon = ref<HabitIcon | ''>('')
const selectedColor = ref('')
const reason = ref('')

const iconDialog = ref<HTMLDialogElement | null>(null)
const colorDialog = ref<HTMLDialogElement | null>(null)

const selectedIconOption = computed(() => {
  return iconOptions.find(icon => icon.value === selectedIcon.value)
})

const validationErrors = ref({
  name: '',
  periodicity: '',
  weekdays: '',
  duration: ''
})

onMounted(async () => {
  await habitStore.loadAllHabits()

  if (selectedHabit.value) {
    fillFormFromHabit(selectedHabit.value)
  }
})

function clearValidationErrors() {
  validationErrors.value = {
    name: '',
    periodicity: '',
    weekdays: '',
    duration: ''
  }
}

function validateForm(): boolean {
  clearValidationErrors()

  if (!editTitle.value.trim()) {
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

function fillFormFromHabit(habit: Habit) {
  selectedHabit.value = habit
  editTitle.value = habit.title

  // Gespeicherte Werte vorausfüllen — falls noch nicht vorhanden: leerer Default
  selectedIcon.value = (habit.icon as HabitIcon) ?? ''
  selectedColor.value = habit.color ?? ''
  selectedPeriodicity.value = habit.periodicity ?? ''
  selectedWeekdays.value = habit.weekdays ? [...habit.weekdays] : []
  selectedTime.value = habit.scheduledTime ?? ''
  duration.value = habit.duration ?? ''
  reason.value = habit.reason ?? ''
  difficulty.value = ''

  clearValidationErrors()
}

function startEditingHabit(habit: Habit) {
  fillFormFromHabit(habit)
  habitStore.setHabitToEdit(habit)
  isEditingForm.value = true
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

function backToSelection() {
  isEditingForm.value = false
  clearValidationErrors()
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

async function handleUpdate() {
  if (!selectedHabit.value || !validateForm()) return

  await habitStore.updateHabit(selectedHabit.value.id, {
    title: editTitle.value.trim(),
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
    <header class="app-page-header">
      <button
        class="app-back-button"
        type="button"
        @click="isEditingForm ? backToSelection() : $emit('changeView', 'home')"
      >
        &larr;
      </button>

      <h1 class="app-page-title">
        {{ isEditingForm ? labels.habitEdit.title : labels.habitEdit.selectTitle }}
      </h1>
    </header>

    <div class="app-tabs">
      <button class="app-tab active" type="button">
        {{ labels.habitCreate.habitTab }}
      </button>

      <button class="app-tab" type="button" disabled>
        {{ labels.habitCreate.viceTab }}
      </button>
    </div>

    <template v-if="!isEditingForm">
      <section class="app-card edit-selection-card">
        <h2 class="app-section-title">{{ labels.habitDelete.habitsLabel }}</h2>

        <p v-if="habitStore.isLoading" class="edit-status">
          Loading habits...
        </p>

        <p v-else-if="habitStore.error" class="edit-error">
          {{ habitStore.error }}
        </p>

        <p v-else-if="habitStore.habits.length === 0" class="edit-status">
          {{ labels.habitEdit.empty }}
        </p>

        <ul v-else class="edit-list">
          <li
            v-for="habit in habitStore.habits"
            :key="habit.id"
            class="edit-list-row"
          >
            <button
              class="edit-list-button"
              type="button"
              @click="startEditingHabit(habit)"
            >
              {{ habit.title }}
            </button>
          </li>
        </ul>
      </section>
    </template>

    <template v-else>
      <section class="app-card">
        <form class="app-form" novalidate @submit.prevent="handleUpdate">
          <label class="app-label">
            {{ labels.habitCreate.habitLabel }}

            <input
              v-model="editTitle"
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

          <fieldset
            v-if="selectedPeriodicity === 'weekly'"
            class="weekday-fieldset"
          >
            <legend>{{ labels.habitCreate.weekdaysLabel }}</legend>

            <label class="weekday-option">
              <input v-model="selectedWeekdays" type="checkbox" value="monday" />
              {{ labels.habitCreate.weekdays.monday }}
            </label>

            <label class="weekday-option">
              <input v-model="selectedWeekdays" type="checkbox" value="tuesday" />
              {{ labels.habitCreate.weekdays.tuesday }}
            </label>

            <label class="weekday-option">
              <input v-model="selectedWeekdays" type="checkbox" value="wednesday" />
              {{ labels.habitCreate.weekdays.wednesday }}
            </label>

            <label class="weekday-option">
              <input v-model="selectedWeekdays" type="checkbox" value="thursday" />
              {{ labels.habitCreate.weekdays.thursday }}
            </label>

            <label class="weekday-option">
              <input v-model="selectedWeekdays" type="checkbox" value="friday" />
              {{ labels.habitCreate.weekdays.friday }}
            </label>

            <label class="weekday-option">
              <input v-model="selectedWeekdays" type="checkbox" value="saturday" />
              {{ labels.habitCreate.weekdays.saturday }}
            </label>

            <label class="weekday-option">
              <input v-model="selectedWeekdays" type="checkbox" value="sunday" />
              {{ labels.habitCreate.weekdays.sunday }}
            </label>

            <span v-if="validationErrors.weekdays" class="field-error">
              {{ validationErrors.weekdays }}
            </span>
          </fieldset>

          <label class="app-label">
            {{ labels.habitCreate.timeLabel }}
            <input v-model="selectedTime" class="app-input" type="time" />
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
            {{ habitStore.isLoading ? labels.habitEdit.saving : labels.habitEdit.save }}
          </button>

          <p v-if="habitStore.error" class="field-error">
            {{ habitStore.error }}
          </p>
        </form>
      </section>

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
    </template>
  </main>
</template>

<style scoped>
.edit-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.edit-selection-card {
  padding: 18px 16px 28px;
}

.edit-list-row {
  margin-bottom: 12px;
}

.edit-list-button {
  display: block;
  width: 100%;
  background: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 18px 18px;
  color: #1f1f1f;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.edit-status,
.edit-error {
  margin: 0;
  font-size: 13px;
}

.edit-error,
.field-error {
  color: #b00020;
}

.app-create-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-select,
.color-option,
.weekday-option,
.weekday-option input,
.app-input[type='time'] {
  cursor: pointer;
}

.input-error {
  border-color: #b00020;
}

.field-error {
  font-size: 12px;
}

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

.color-dialog,
.icon-dialog {
  width: min(342px, calc(100% - 32px));
  padding: 16px;
  border: 0;
  border-radius: 14px;
}

.color-dialog::backdrop,
.icon-dialog::backdrop {
  background: rgb(0 0 0 / 40%);
}

.icon-dialog-header,
.color-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-dialog-header h2,
.color-dialog-header h2 {
  margin: 0;
  font-size: 18px;
}

.icon-dialog-close,
.color-dialog-close {
  border: 0;
  background: transparent;
  font-size: 24px;
}

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
