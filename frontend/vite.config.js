import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper SPA fallback
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['chart.js', 'ethers']
        }
      }
    }
  },
  // Add base URL configuration
  base: '/',
  optimizeDeps: {
    include: ['chart.js', 'ethers']
  }
})
