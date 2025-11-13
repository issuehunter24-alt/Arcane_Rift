import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        type: 'module',
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '빈틈없는 악역영애 카드 배틀',
        short_name: '악역영애 배틀',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0d1a',
        theme_color: '#0b0d1a',
        description: '스토리 기반 전략 카드 배틀',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ sameOrigin, url }) =>
              sameOrigin && url.pathname.startsWith('/characters/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'character-assets-v1',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 128,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ sameOrigin, url }) =>
              sameOrigin && (url.pathname.startsWith('/backgrounds/') || url.pathname.startsWith('/cards/') || url.pathname.startsWith('/cardIcons/')),
            handler: 'CacheFirst',
            options: {
              cacheName: 'environment-assets-v1',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 256,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-v1',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache-v1',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 가능하도록 설정 (모바일 접속용)
    open: true
  },
  build: {
    sourcemap: true
  }
});


