import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'UangSaya',
        short_name: 'UangSaya',
        description: 'Aplikasi manajemen keuangan pribadi',
        theme_color: '#7F77DD',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
          return 'react-vendor'
        }
        if (id.includes('node_modules/recharts')) {
          return 'chart-vendor'
        }
        if (id.includes('node_modules/dexie')) {
          return 'db-vendor'
        }
        if (id.includes('node_modules/date-fns')) {
          return 'date-vendor'
        }
      },
    },
  },
},
})