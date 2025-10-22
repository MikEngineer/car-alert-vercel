import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // permette accesso anche da rete locale
    port: 5174,      // usa porta stabile
  },
})
