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
    }
  }
})
