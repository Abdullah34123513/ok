import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      '@components': fileURLToPath(new URL('./components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./pages', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./hooks', import.meta.url)),
      '@contexts': fileURLToPath(new URL('./contexts', import.meta.url)),
    }
  }
})
