import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Router } from 'vue-router'

// Importar las rutas definidas
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

// Recrear el guard del router
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
      // 1. Navegar a home (sin auth)
      await router.push('/')
      expect(router.currentRoute.value.name).toBe('home')

      // 2. Intentar ir a dashboard (debe redirigir a login)
      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('login')

      // 3. Simular login
      sessionStorage.setItem('token', 'test-token')
      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('dashboard')

      // 4. Intentar ir a login estando autenticado (debe redirigir a dashboard)
      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('dashboard')

      // 5. Simular logout
      sessionStorage.removeItem('token')
      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('login')
    })

    it('debe preservar la ruta después del login', async () => {
      // 1. Intentar acceder a dashboard sin auth
      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('login')

      const redirectPath = router.currentRoute.value.query.redirect as string
      expect(redirectPath).toBe('/dashboard')

      // 2. Simular login exitoso
      sessionStorage.setItem('token', 'test-token')

      // 3. Navegar a la ruta guardada
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
      // Sin auth, intentar ir a dashboard
      await router.push('/dashboard')
      expect(router.currentRoute.value.name).toBe('login')

      // Autenticarse
      sessionStorage.setItem('token', 'token')

      // Intentar ir a login (debe redirigir a dashboard)
      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('dashboard')
    })
  })
})
