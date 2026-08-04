import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  { path: '/', name: 'weather-home', component: () => import('../views/WeatherHomeView.vue') },
  { path: '/about', name: 'weather-about', component: () => import('../views/WeatherAboutView.vue') },
  { path: '/mock-api', name: 'mock-api', component: () => import('../views/MockApiView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/AuthDashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('../views/WeatherDetailView.vue'),
    props: true,
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && authStore.isLoggedIn) return { name: 'dashboard' }
})

export default router
