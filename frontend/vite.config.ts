import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true
  },
  server: {
    allowedHosts: [
      "fri-agreed-crucial-retailers.trycloudflare.com", // Your Cloudflare Tunnel URL
      ".trycloudflare.com" // Allow all trycloudflare.com subdomains (optional)
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
