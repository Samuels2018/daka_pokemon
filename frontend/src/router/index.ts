import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
