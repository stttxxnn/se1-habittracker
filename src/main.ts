import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/presentation/App.vue'
import '@/presentation/assets/design-system.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')