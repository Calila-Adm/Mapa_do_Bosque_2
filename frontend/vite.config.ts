import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Permite qualquer host (necessário para ngrok)
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app',
      'localhost',
    ],
  },
})
