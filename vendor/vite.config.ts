import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001
  },
  resolve: {
    alias: {
      // FIX: __dirname is not available in ES modules. Using import.meta.url to resolve path.
      '@shared': fileURLToPath(new URL('../shared', import.meta.url))
    }
  }
})
