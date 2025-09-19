// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },

      includeAssets: [
        'favicon.ico',
        'logos/favicon-192x192.png',
        'logos/favicon-512x512.png'
      ],

      manifest: {
        name: 'TABX-tech · Calculadora de Precios',
        short_name: 'TABX',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#111111',
        icons: [
          {
            src: '/logos/favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logos/favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: '/logos/screenshot1.png',
            sizes: '1280x720',
            type: 'image/png'
          },
          {
            src: '/logos/screenshot2.png',
            sizes: '720x1280',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})

