import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Modo "preview": gera um único index.html (sem service worker) para pré-visualização.
// Modo normal: gera o PWA completo para publicar (Netlify, Vercel etc.).
export default defineConfig(({ mode }) => {
  const preview = mode === 'preview';
  return {
    base: './',
    build: { outDir: preview ? 'dist-preview' : 'dist' },
    plugins: [
      react(),
      preview
        ? viteSingleFile()
        : VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg', 'apple-touch-icon.png'],
            manifest: {
              name: 'Pico Trip',
              short_name: 'Pico Trip',
              description: 'Planeje sua viagem de ski e snowboard: neve em tempo real, passe e hospedagem.',
              lang: 'pt-BR',
              theme_color: '#13394A',
              background_color: '#F7F5F0',
              display: 'standalone',
              start_url: './',
              icons: [
                { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
              ]
            },
            workbox: {
              runtimeCaching: [
                {
                  // Condição de neve: tenta a rede, usa o cache se o usuário estiver sem sinal.
                  urlPattern: /^https:\/\/api\.open-meteo\.com\//,
                  handler: 'NetworkFirst',
                  options: { cacheName: 'clima', expiration: { maxAgeSeconds: 60 * 60 * 6 }, networkTimeoutSeconds: 6 }
                },
                {
                  urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
                  handler: 'StaleWhileRevalidate',
                  options: { cacheName: 'fontes' }
                }
              ]
            }
          })
    ]
  };
});
