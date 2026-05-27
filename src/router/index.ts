import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/components/timeline/TimelineView.vue'
import AddTripView from '@/components/trip/AddTripView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/add-trip',
      name: 'add-trip',
      component: AddTripView,
    },
  ],
})

export default router