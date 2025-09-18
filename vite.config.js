import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: [
        'favicon.ico',
        'logos/favicon-16x16.png',
        'logos/favicon-32x32.png',
        'logos/favicon-144x144.png',
        'logos/favicon-192x192.png',
        'logos/favicon-256x256.png',
        'logos/favicon-512x512.png',
        'logos/screenshot1.png',
        'logos/screenshot2.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
