import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Files the SW pre-caches at install time (the "app shell")
      // vite-plugin-pwa auto-includes the built JS/CSS; list extra static assets here.
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable.png'],

      manifest: {
        name: 'Pick Word',
        short_name: 'Pick Word',
        description: 'Daily vocabulary practice for kids — flashcards, challenges, and writing lists',
        start_url: 'https://github.com/namnhatdoan/pick-word',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F5EFE0',
        theme_color: '#2A2015',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',       // Android adaptive icon safe zone
          },
        ],
        categories: ['education', 'kids'],
      },

      workbox: {
        // Cache strategy for the app shell (JS/CSS/HTML):
        // networkFirst means always try network, fall back to cache.
        // For an offline-first app, we use CacheFirst for the shell so it
        // loads instantly, and NetworkFirst for any external resources.

        // Pre-cache everything in the build output
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Runtime caching for external image URLs (Unsplash etc.)
        // Only matters for words whose images haven't been converted to base64 yet.
        runtimeCaching: [
          {
            // Google Fonts CSS
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // External word images (Unsplash, etc.) — cache as they are viewed
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'word-images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 }, // 60 days
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
