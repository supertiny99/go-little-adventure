import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 相对路径适配 GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
  ],
})
