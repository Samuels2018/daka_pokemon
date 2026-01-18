import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  localStorage.clear()
})

vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:3000/api',
    VITE_WS_URL: 'http://localhost:3000',
    BASE_URL: '/',
  },
})
