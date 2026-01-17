<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  const currentRoute = router.currentRoute.value
  if (currentRoute.meta.requiresAuth) {
    router.push('/login')
  }
}

onMounted(async () => {
  await authStore.initializeAuth()

  const intervalId = window.setInterval(() => {
    const storedToken = sessionStorage.getItem('token')

    if (authStore.token && !storedToken) {
      handleLogout()
    }
  }, 1000)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__tokenWatcher = intervalId
})

onUnmounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).__tokenWatcher) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearInterval((window as any).__tokenWatcher)
  }
})

watch(
  () => authStore.token,
  (newToken) => {
    if (!newToken) {
      sessionStorage.removeItem('token')
    }
  },
)
</script>

<template>
  <div class="h-full">
    <router-view />
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
