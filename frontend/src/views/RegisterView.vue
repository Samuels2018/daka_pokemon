<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const isSubmitting = ref(false)

const registerSchema = toTypedSchema(
  z
    .object({
      username: z
        .string()
        .min(1, 'El nombre de usuario es requerido')
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(20, 'El nombre de usuario no puede exceder 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo se permiten letras, números y guiones bajos'),
      password: z
        .string()
        .min(1, 'La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña no puede exceder 100 caracteres'),
      confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    }),
)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: registerSchema,
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await authStore.register(
      values.username,
      values.password,
      values.confirmPassword,
    )

    successMessage.value = response.message || 'Usuario registrado exitosamente'

    setTimeout(() => {
      router.push('/login')
    }, 2000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al registrar usuario'
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white px-8 py-10 shadow-xl rounded-lg">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p class="mt-2 text-sm text-gray-600">
            ¿Ya tienes cuenta?
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión aquí
            </router-link>
          </p>
        </div>

        <!-- Success Alert -->
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="ml-3 text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="ml-3 text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Formulario -->
        <form @submit="onSubmit" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <input
              id="username"
              v-model="username"
              v-bind="usernameAttrs"
              type="text"
              class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{
                'border-red-300': errors.username,
                'border-gray-300': !errors.username,
              }"
              placeholder="usuario123"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{
                'border-red-300': errors.password,
                'border-gray-300': !errors.password,
              }"
              placeholder="••••••••"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
            <p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              v-bind="confirmPasswordAttrs"
              type="password"
              class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{
                'border-red-300': errors.confirmPassword,
                'border-gray-300': !errors.confirmPassword,
              }"
              placeholder="••••••••"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!isSubmitting">Crear Cuenta</span>
            <span v-else class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Registrando...
            </span>
          </button>
        </form>

        <!-- Back to Home -->
        <div class="mt-6 text-center">
          <router-link to="/" class="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al inicio
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>
