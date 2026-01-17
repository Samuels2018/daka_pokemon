<script setup lang="ts">
// TODO: Implementar Dashboard con WebSockets
// Requisitos:
// 1. Conectar a WebSocket (autenticado con JWT)
// 2. Mostrar lista de sprites recibidos
// 3. Botón para solicitar nuevo sprite
// 4. Botón para limpiar lista
// 5. Implementar logout

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

interface PokemonSprite {
  id: number
  url: string
  name: string
}

const sprites = ref<PokemonSprite[]>([])
const socket = ref<Socket | null>(null)
const isConnected = ref(false)
const isRequestingSprite = ref(false)
const connectionError = ref<string>('')

const userName = computed(() => authStore.user?.username || 'Usuario')
const hasSprites = computed(() => sprites.value.length > 0)

const connectWebSocket = () => {
  const token = sessionStorage.getItem('token')

  if (!token) {
    connectionError.value = 'No hay token de autenticación'
    return
  }

  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

  socket.value = io(wsUrl, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
  })

  socket.value.on('connected', (data) => {
    console.log('WebSocket connected:', data)
    isConnected.value = true
    connectionError.value = ''
  })

  socket.value.on('sprite-served', (sprite: PokemonSprite) => {
    console.log('Sprite received:', sprite)
    sprites.value.unshift(sprite)
    isRequestingSprite.value = false
  })

  socket.value.on('sprite-deleted', (result: { deleted: boolean; id: number }) => {
    if (result.deleted) {
      sprites.value = sprites.value.filter((s) => s.id !== result.id)
    }
  })

  socket.value.on('all-sprites-deleted', () => {
    sprites.value = []
  })

  socket.value.on('sprite-error', (error: { message: string }) => {
    console.error('Sprite error:', error)
    connectionError.value = error.message
    isRequestingSprite.value = false
  })

  socket.value.on('error', (error: { message: string }) => {
    console.error('WebSocket error:', error)
    connectionError.value = error.message
    isConnected.value = false
  })

  socket.value.on('disconnect', () => {
    console.log('WebSocket disconnected')
    isConnected.value = false
  })

  socket.value.on('connect_error', (error) => {
    console.error('Connection error:', error)
    connectionError.value = 'Error al conectar con el servidor'
    isConnected.value = false
  })
}

const requestSprite = () => {
  if (!socket.value || !isConnected.value) {
    connectionError.value = 'No hay conexión con el servidor'
    return
  }

  isRequestingSprite.value = true
  connectionError.value = ''
  socket.value.emit('request-sprite')
}

const deleteSprite = (id: number) => {
  if (!socket.value || !isConnected.value) return

  socket.value.emit('delete-sprite', { id })
}

const deleteAllSprites = () => {
  if (!socket.value || !isConnected.value) return

  if (confirm('¿Estás seguro de que quieres eliminar todos los sprites?')) {
    socket.value.emit('delete-all-sprites')
  }
}

const handleLogout = async () => {
  if (socket.value) {
    socket.value.disconnect()
  }

  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">Pokémon Dashboard</h1>
            <p class="mt-1 text-gray-600">
              Bienvenido, <span class="font-semibold text-indigo-600">{{ userName }}</span>
            </p>
          </div>
          <button
            @click="handleLogout"
            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
          >
            Cerrar Sesión
          </button>
        </div>

        <!-- Connection Status -->
        <div class="mt-4 flex items-center gap-2">
          <div
            class="h-3 w-3 rounded-full"
            :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
          ></div>
          <span class="text-sm text-gray-600">
            {{ isConnected ? 'Conectado al servidor' : 'Desconectado' }}
          </span>
        </div>

        <!-- Error Alert -->
        <div v-if="connectionError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ connectionError }}</p>
        </div>
      </header>

      <!-- Controls -->
      <div class="mb-8 flex flex-wrap gap-4">
        <button
          @click="requestSprite"
          :disabled="!isConnected || isRequestingSprite"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span v-if="!isRequestingSprite">🎲 Solicitar Sprite Aleatorio</span>
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
            Obteniendo...
          </span>
        </button>

        <button
          @click="deleteAllSprites"
          :disabled="!isConnected || !hasSprites"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          🗑️ Limpiar Todos
        </button>

        <div class="ml-auto flex items-center text-gray-600">
          <span class="text-sm font-medium">
            Total: {{ sprites.length }} sprite{{ sprites.length !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <!-- Sprites Grid -->
      <div
        v-if="hasSprites"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <TransitionGroup name="sprite">
          <div
            v-for="sprite in sprites"
            :key="sprite.id"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow transform hover:scale-105 duration-300"
          >
            <!-- Imagen -->
            <div
              class="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6"
            >
              <img
                :src="sprite.url"
                :alt="sprite.name"
                class="max-w-full max-h-full object-contain pixelated"
                loading="lazy"
              />
            </div>

            <!-- Info -->
            <div class="p-4">
              <h3 class="text-lg font-bold text-gray-900 capitalize text-center mb-3">
                {{ sprite.name }}
              </h3>

              <!-- Delete Button -->
              <button
                @click="deleteSprite(sprite.id)"
                class="w-full px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-xl shadow-lg p-12 text-center">
        <div class="max-w-md mx-auto">
          <div class="text-6xl mb-4">🎮</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No hay sprites todavía</h3>
          <p class="text-gray-600 mb-6">
            Haz clic en "Solicitar Sprite Aleatorio" para obtener tu primer Pokémon
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animaciones de entrada/salida para sprites */
.sprite-enter-active {
  animation: sprite-in 0.5s ease-out;
}

.sprite-leave-active {
  animation: sprite-out 0.3s ease-in;
}

@keyframes sprite-in {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes sprite-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* Estilo pixelado para sprites de Pokémon */
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
