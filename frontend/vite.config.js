import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      host: '127.0.0.1',
      port: 5173,
      overlay: true
    }
  },

  preview: {
    host: '0.0.0.0',
    port: 4173
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('scheduler')
          ) {
            return 'react'
          }

          if (id.includes('firebase')) {
            return 'firebase'
          }

          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },

  base: '/',

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ]
  }
})