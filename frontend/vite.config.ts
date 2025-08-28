import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src')
    },
  },
  server: {
    host: true, // Necessário para Docker
    port: 5173,
    watch: {
      usePolling: true, // Necessário para hot reload no Docker
    },
  },
  // JSZip removido - causava problemas de compatibilidade
})