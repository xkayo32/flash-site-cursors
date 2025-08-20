import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    host: true, // Necessário para Docker
    port: 5173,
    watch: {
      usePolling: true, // Necessário para hot reload no Docker
    },
  },
  optimizeDeps: {
    include: ['jszip']
  },
  build: {
    commonjsOptions: {
      include: [/jszip/, /node_modules/]
    }
  }
})