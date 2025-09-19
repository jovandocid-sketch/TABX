// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },

      includeAssets: [
        'favicon.ico',
        'logos/favicon-16x16.png',
        'logos/favicon-32x32.png',
        'logos/favicon-192x192.png',
        'logos/favicon-256x256.png',
        'logos/favicon-512x512.png',
      ],

      manifest: {
        name: 'Calculadora de Precios',
        short_name: 'CalcPrecios',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#111111',

        icons: [
          {
            src: 'logos/favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logos/favicon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'logos/favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],

        screenshots: [
          {
            src: 'logos/screenshot1.png',
            sizes: '1280x720',
            type: 'image/png'
          },
          {
            src: 'logos/screenshot2.png',
            sizes: '720x1280',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})


