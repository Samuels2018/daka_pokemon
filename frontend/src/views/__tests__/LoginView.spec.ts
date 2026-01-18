import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from '../LoginView.vue'
import { useAuthStore } from '../../stores/auth'

const createMockRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
    ],
  })
}

describe('LoginView', () => {
  let router: ReturnType<typeof createMockRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createMockRouter()
    sessionStorage.clear()
  })

  const mountComponent = () => {
    return mount(LoginView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('debe renderizar el formulario de login correctamente', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('h1').text()).toBe('Iniciar Sesión')
    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('debe mostrar errores de validación cuando los campos están vacíos', async () => {
    const wrapper = mountComponent()
    const form = wrapper.find('form')

    await form.trigger('submit')
    await wrapper.vm.$nextTick()

    await new Promise((resolve) => setTimeout(resolve, 100))

    const errors = wrapper.findAll('.text-red-600')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('debe validar que el username tenga al menos 3 caracteres', async () => {
    const wrapper = mountComponent()
    const usernameInput = wrapper.find('input#username')

    await usernameInput.setValue('ab')
    await usernameInput.trigger('blur')
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    const errorText = wrapper.text()
    expect(errorText).toContain('al menos 3 caracteres')
  })

  it('debe validar que el password tenga al menos 6 caracteres', async () => {
    const wrapper = mountComponent()
    const passwordInput = wrapper.find('input#password')

    await passwordInput.setValue('12345')
    await passwordInput.trigger('blur')
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    const errorText = wrapper.text()
    expect(errorText).toContain('al menos 6 caracteres')
  })

  it('debe redirigir al dashboard después de un login exitoso', async () => {
    const wrapper = mountComponent()
    const authStore = useAuthStore()

    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      id: 1,
      username: 'testuser',
    })

    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(pushSpy).toHaveBeenCalledWith('/dashboard')
  })

  it('debe mostrar mensaje de error cuando el login falla', async () => {
    const wrapper = mountComponent()
    const authStore = useAuthStore()

    vi.spyOn(authStore, 'login').mockRejectedValueOnce(new Error('Credenciales inválidas'))

    await wrapper.find('input#username').setValue('wronguser')
    await wrapper.find('input#password').setValue('wrongpass')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Credenciales inválidas')
  })

  it('debe tener un link al formulario de registro', () => {
    const wrapper = mountComponent()
    const registerLink = wrapper.find('a[href="/register"]')

    expect(registerLink.exists()).toBe(true)
    expect(registerLink.text()).toContain('Regístrate aquí')
  })

  it('debe tener un link para volver al inicio', () => {
    const wrapper = mountComponent()
    const homeLink = wrapper.find('a[href="/"]')

    expect(homeLink.exists()).toBe(true)
    expect(homeLink.text()).toContain('Volver al inicio')
  })

  it('debe redirigir a la ruta guardada después del login', async () => {
    await router.push('/login?redirect=/dashboard')

    const wrapper = mountComponent()
    const authStore = useAuthStore()

    vi.spyOn(authStore, 'login').mockResolvedValueOnce({
      id: 1,
      username: 'testuser',
    })

    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(pushSpy).toHaveBeenCalledWith('/dashboard')
  })
})
