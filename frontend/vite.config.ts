import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/app/src'
    },
  },
  server: {
    host: true, // Necessário para Docker
    port: 5173,
    watch: {
      usePolling: true, // Necessário para hot reload no Docker
    },
  },
})