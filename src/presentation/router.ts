import HomeView from '@/presentation/views/HomeView.vue'
import HabitCreateView from '@/presentation/views/HabitCreateView.vue'
import HabitEditView from '@/presentation/views/HabitEditView.vue'
import HabitDeleteView from '@/presentation/views/HabitDeleteView.vue'
import SettingsView from '@/presentation/views/SettingsView.vue'
// import CalendarView from '@/presentation/views/CalendarView.vue'
import AnalyticsView from '@/presentation/views/AnalyticsView.vue'

import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: HomeView },
  { path: '/settings', component: SettingsView },
  { path: '/analytics', component: AnalyticsView },
  //needs id (dynamic route matching)
  //in create case, id wouldnt be created till habit is created,
  //temp id-session?
  //or warn user about unsaved changes
  //DEFINE CHILDREN
  {
    path: '/habit/create',
    name: 'habit_create',
    component: HabitCreateView
  },
  {
    path: '/habit/edit/:id',
    name: 'habit_edit',
    component: HabitEditView,
  },
  {
    path: '/habit/delete',
    name: 'habit_delete',
    component: HabitDeleteView
  }, 
]

export const router = createRouter({
  history: createWebHistory(), //html5 mode, shows full url
  routes,
})

export function habit_edit_route(id: string) {
  router.push({name:"habit_edit", params: {id: id}})
}