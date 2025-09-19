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
      manifest: {
        name: 'TABX-tech · Calculadora de Precios',
        short_name: 'TABX',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
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
          },
          {
            src: '/logos/favicon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: '/logos/screenshot1.png',
            sizes: '640x480',
            type: 'image/png'
          },
          {
            src: '/logos/screenshot2.png',
            sizes: '1280x720',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})

