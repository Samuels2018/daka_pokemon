<script setup lang="ts">
// Página de inicio modernizada
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-4xl w-full text-center space-y-8">
      <!-- Hero Section -->
      <div>
        <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span class="block">Bienvenido a la</span>
          <span class="block text-indigo-600">Aplicación Daka</span>
        </h1>
        <p
          class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
        >
          Explora nuestra prueba técnica full-stack diseñada con tecnologías modernas: NestJS, Vue
          3, TailwindCSS y WebSockets.
        </p>
      </div>

      <!-- Features Section -->
      <div class="mt-10">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
          <div class="pt-6">
            <div class="flow-root bg-white rounded-lg px-6 pb-8">
              <div class="-mt-6">
                <div>
                  <span
                    class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg"
                  >
                    <!-- Heroicon name: outline/lock-closed -->
                    <svg
                      class="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                </div>
                <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                  Autenticación Robusta
                </h3>
                <p class="mt-5 text-base text-gray-500">
                  Sistema completo de Login y Registro seguro con JWT, validaciones con Zod y
                  protección de rutas.
                </p>
              </div>
            </div>
          </div>

          <div class="pt-6">
            <div class="flow-root bg-white rounded-lg px-6 pb-8">
              <div class="-mt-6">
                <div>
                  <span
                    class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg"
                  >
                    <!-- Heroicon name: outline/lightning-bolt -->
                    <svg
                      class="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </span>
                </div>
                <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                  WebSockets & Sprites
                </h3>
                <p class="mt-5 text-base text-gray-500">
                  Gestión en tiempo real de Sprites de Pokémon, con animaciones fluidas y
                  actualizaciones instantáneas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="mt-10 flex justify-center gap-4 flex-wrap">
        <router-link
          to="/login"
          class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out transform hover:scale-105"
        >
          Iniciar Sesión
        </router-link>
        <router-link
          to="/register"
          class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out transform hover:scale-105"
        >
          Registrarse
        </router-link>
        <router-link
          to="/dashboard"
          class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out transform hover:scale-105"
        >
          Ver Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
