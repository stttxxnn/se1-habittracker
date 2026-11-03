import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/presentation/App.vue'
import '@/presentation/assets/design-system.css'
import { SupabaseHabitAdapter } from '@/infrastructure/Adapter/SupabaseHabitAdapter'
import { createHabitUseCases, HABIT_USE_CASES } from '@/compositionRoot'

const app = createApp(App)
const pinia = createPinia()

// Hier (und nur hier) wird entschieden, welcher Adapter benutzt wird
app.provide(HABIT_USE_CASES, createHabitUseCases(new SupabaseHabitAdapter()))

app.use(pinia)
app.mount('#app')
