import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import client from '../../api/client'

vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    sessionStorage.clear()

    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debe inicializar con valores por defecto', () => {
      const authStore = useAuthStore()

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('debe hacer login exitosamente y guardar el token', async () => {
      const authStore = useAuthStore()
      const mockResponse = {
        data: {
          accessToken: 'test-token-123',
          user: {
            id: 1,
            username: 'testuser',
          },
        },
      }

      vi.mocked(client.post).mockResolvedValueOnce(mockResponse)

      const result = await authStore.login('testuser', 'password123')

      expect(client.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123',
      })

      expect(authStore.token).toBe('test-token-123')
      expect(authStore.user).toEqual({ id: 1, username: 'testuser' })
      expect(authStore.isAuthenticated).toBe(true)
      expect(sessionStorage.getItem('token')).toBe('test-token-123')
      expect(result).toEqual({ id: 1, username: 'testuser' })
    })

    it('debe manejar errores de login', async () => {
      const authStore = useAuthStore()
      const mockError = {
        response: {
          data: {
            message: 'Credenciales inválidas',
          },
        },
      }

      vi.mocked(client.post).mockRejectedValueOnce(mockError)

      await expect(authStore.login('testuser', 'wrongpassword')).rejects.toThrow(
        'Credenciales inválidas',
      )

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.error).toBe('Credenciales inválidas')
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('debe establecer loading durante el login', async () => {
      const authStore = useAuthStore()
      const mockResponse = {
        data: {
          accessToken: 'token',
          user: { id: 1, username: 'user' },
        },
      }

      vi.mocked(client.post).mockImplementation(() => {
        expect(authStore.loading).toBe(true)
        return Promise.resolve(mockResponse)
      })

      await authStore.login('user', 'pass')

      expect(authStore.loading).toBe(false)
    })
  })

  describe('register', () => {
    it('debe registrar un usuario exitosamente', async () => {
      const authStore = useAuthStore()
      const mockResponse = {
        data: {
          message: 'Usuario registrado exitosamente',
          username: 'newuser',
        },
      }

      vi.mocked(client.post).mockResolvedValueOnce(mockResponse)

      const result = await authStore.register('newuser', 'password123', 'password123')

      expect(client.post).toHaveBeenCalledWith('/auth/register', {
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(result).toEqual(mockResponse.data)
      expect(authStore.error).toBeNull()
    })

    it('debe manejar errores de registro', async () => {
      const authStore = useAuthStore()
      const mockError = {
        response: {
          data: {
            message: 'El usuario ya existe',
          },
        },
      }

      vi.mocked(client.post).mockRejectedValueOnce(mockError)

      await expect(authStore.register('existinguser', 'pass', 'pass')).rejects.toThrow(
        'El usuario ya existe',
      )

      expect(authStore.error).toBe('El usuario ya existe')
    })
  })

  describe('fetchUser', () => {
    it('debe obtener el usuario actual', async () => {
      const authStore = useAuthStore()
      authStore.token = 'valid-token'

      const mockUser = { id: 1, username: 'testuser' }
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockUser })

      const result = await authStore.fetchUser()

      expect(client.get).toHaveBeenCalledWith('/auth/me')
      expect(authStore.user).toEqual(mockUser)
      expect(result).toEqual(mockUser)
    })

    it('debe limpiar auth si falla la petición', async () => {
      const authStore = useAuthStore()
      authStore.token = 'invalid-token'

      vi.mocked(client.get).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(authStore.fetchUser()).rejects.toThrow()

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(sessionStorage.getItem('token')).toBeNull()
    })

    it('debe fallar si no hay token', async () => {
      const authStore = useAuthStore()

      await expect(authStore.fetchUser()).rejects.toThrow('No token available')
    })
  })

  describe('initializeAuth', () => {
    it('debe restaurar la sesión desde sessionStorage', async () => {
      sessionStorage.setItem('token', 'stored-token')

      const authStore = useAuthStore()
      const mockUser = { id: 1, username: 'testuser' }
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockUser })

      await authStore.initializeAuth()

      expect(authStore.token).toBe('stored-token')
      expect(authStore.user).toEqual(mockUser)
    })

    it('debe limpiar auth si el token almacenado es inválido', async () => {
      sessionStorage.setItem('token', 'invalid-token')

      const authStore = useAuthStore()
      vi.mocked(client.get).mockRejectedValueOnce(new Error('Unauthorized'))

      await authStore.initializeAuth()

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(sessionStorage.getItem('token')).toBeNull()
    })
  })

  describe('logout', () => {
    it('debe limpiar el estado y sessionStorage', async () => {
      const authStore = useAuthStore()
      authStore.token = 'token'
      authStore.user = { id: 1, username: 'user' }
      sessionStorage.setItem('token', 'token')

      await authStore.logout()

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(sessionStorage.getItem('token')).toBeNull()
    })
  })

  describe('clearError', () => {
    it('debe limpiar el error', () => {
      const authStore = useAuthStore()
      authStore.error = 'Test error'

      authStore.clearError()

      expect(authStore.error).toBeNull()
    })
  })

  describe('isAuthenticated computed', () => {
    it('debe retornar true cuando hay token y usuario', () => {
      const authStore = useAuthStore()
      authStore.token = 'token'
      authStore.user = { id: 1, username: 'user' }

      expect(authStore.isAuthenticated).toBe(true)
    })

    it('debe retornar false cuando falta el token', () => {
      const authStore = useAuthStore()
      authStore.user = { id: 1, username: 'user' }

      expect(authStore.isAuthenticated).toBe(false)
    })

    it('debe retornar false cuando falta el usuario', () => {
      const authStore = useAuthStore()
      authStore.token = 'token'

      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})
