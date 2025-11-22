
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004
  },
  resolve: {
    alias: {
      '@shared/api': fileURLToPath(new URL('../shared/api/index.ts', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url))
    }
  }
})
