import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Resolves imports like @/components
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // Dev server config - fixes Termux websocket issues
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: false, // Try next port if 5173 is taken
    hmr: {
      host: '127.0.0.1', // Force IP instead of localhost
      port: 5173,
      overlay: true
    }
  },

  // Preview server config for `npm run preview`
  preview: {
    host: true,
    port: 4173
  },

  // Build config
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Set to true if you need to debug prod
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },

  // Base URL - change if you deploy to subfolder
  base: '/',

  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
})