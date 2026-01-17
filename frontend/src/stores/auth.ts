import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import client from '@/api/client'

export interface User {
  id: number
  username: string
}

interface LoginResponse {
  accessToken: string
  user: User
}

interface RegisterResponse {
  message: string
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const initializeAuth = async () => {
    const storedToken = sessionStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      try {
        await fetchUser()
      } catch {
        clearAuth()
      }
    }
  }

  const login = async (username: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await client.post<LoginResponse>('/auth/login', {
        username,
        password,
      })

      const { accessToken, user: userData } = response.data

      sessionStorage.setItem('token', accessToken)
      token.value = accessToken
      user.value = userData

      return userData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const register = async (username: string, password: string, confirmPassword: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await client.post<RegisterResponse>('/auth/register', {
        username,
        password,
        confirmPassword,
      })

      return response.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    clearAuth()
  }

  const fetchUser = async () => {
    if (!token.value) {
      throw new Error('No token available')
    }

    try {
      const response = await client.get<User>('/auth/me')
      user.value = response.data
      return response.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      clearAuth()
      throw err
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
  }

  const clearError = () => {
    error.value = null
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    initializeAuth,
    clearAuth,
    clearError,
  }
})
