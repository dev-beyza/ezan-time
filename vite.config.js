import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', 
      manifest: {
        name: 'Ezan Time', 
        short_name: 'Ezan Time', 
        description: 'Minimalist Ezan Vakti, Zikirmatik ve Kuran-ı Kerim Uygulaması',
        theme_color: '#18181b', 
        background_color: '#18181b', 
        display: 'standalone', 
        icons: [
          {
            src: 'logo.svg', // Artık PNG yerine doğrudan bu SVG'yi kullanıyoruz
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable' 
          }
        ]
      }
    })
  ]
})