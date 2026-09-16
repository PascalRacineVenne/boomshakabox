import react from '@vitejs/plugin-react'
import wyw from '@wyw-in-js/vite'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    wyw({
      include: ['**/*.{ts,tsx}'],
    }),
    react(),
  ],
})
