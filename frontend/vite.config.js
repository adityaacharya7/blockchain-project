import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    allowedHosts: [
      'e9b5927477b8.ngrok-free.app'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    // Ensure proper SPA fallback
    target: 'esnext',
    minify: 'terser',
    sourcemap: true
  },
  // Add base URL configuration
  base: '/'
})
