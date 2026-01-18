import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Router } from 'vue-router'
const routes = [
  {
    path: '/',
    name: 'home',
    component: { template: '<div>Home</div>' },
  },
  {
    path: '/login',
    name: 'login',
    component: { template: '<div>Login</div>' },
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: { template: '<div>Register</div>' },
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: { template: '<div>Dashboard</div>' },
    meta: { requiresAuth: true },
  },
]

const setupRouter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
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

  return router
}

describe('Router Navigation Guards', () => {
  let router: Router

  beforeEach(() => {
    sessionStorage.clear()
    router = setupRouter()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('Rutas públicas', () => {
    it('debe permitir acceso a la home sin autenticación', async () => {
      await router.push('/')
      expect(router.currentRoute.value.name).toBe('home')
    })
  })

  describe('Rutas protegidas (requiresAuth)', () => {
    it('debe redirigir al login si no está autenticado', async () => {
      await router.push('/dashboard')

      expect(router.currentRoute.value.name).toBe('login')
      expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
    })

    it('debe permitir acceso al dashboard si está autenticado', async () => {
      sessionStorage.setItem('token', 'test-token')

      await router.push('/dashboard')

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('debe guardar la ruta original en query redirect', async () => {
      await router.push('/dashboard')

      expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
    })
  })

  describe('Rutas para invitados (requiresGuest)', () => {
    it('debe permitir acceso al login si no está autenticado', async () => {
      await router.push('/login')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('debe redirigir al dashboard si ya está autenticado', async () => {
      sessionStorage.setItem('token', 'test-token')

      await router.push('/login')

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('debe redirigir al dashboard desde register si está autenticado', async () => {
      sessionStorage.setItem('token', 'test-token')

      await router.push('/register')

      expect(router.currentRoute.value.name).toBe('dashboard')
    })
  })

  describe('Flujo completo de navegación', () => {
    it('debe seguir el flujo: home -> login -> dashboard -> logout -> login', async () => {
      await router.push('/')
      expect(router.currentRoute.value.name).toBe('home')

      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('login')

      sessionStorage.setItem('token', 'test-token')
      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('dashboard')

      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('dashboard')

      sessionStorage.removeItem('token')
      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('login')
    })

    it('debe preservar la ruta después del login', async () => {
      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('login')

      const redirectPath = router.currentRoute.value.query.redirect as string
      expect(redirectPath).toBe('/dashboard')

      sessionStorage.setItem('token', 'test-token')

      await router.push(redirectPath)
      expect(router.currentRoute.value.name).toBe('dashboard')
    })
  })

  describe('Casos edge', () => {
    it('debe manejar tokens vacíos como no autenticado', async () => {
      sessionStorage.setItem('token', '')

      await router.push('/dashboard')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('debe manejar navegación directa sin guards', async () => {
      await router.push('/')

      expect(router.currentRoute.value.name).toBe('home')
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('debe permitir múltiples redirecciones', async () => {
      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('login')

      sessionStorage.setItem('token', 'token')

      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('dashboard')
    })
  })
})
