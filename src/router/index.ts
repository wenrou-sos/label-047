import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
      },
      {
        path: 'property-fees',
        name: 'property-fees',
        component: () => import('@/pages/PropertyFeesPage.vue'),
      },
      {
        path: 'maintenance',
        name: 'maintenance',
        component: () => import('@/pages/MaintenancePage.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/pages/AnalyticsPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
