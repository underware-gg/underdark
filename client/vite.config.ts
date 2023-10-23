import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        underdark: resolve(__dirname, 'underdark/index.html'),
        editor: resolve(__dirname, 'editor/index.html'),
        playtest: resolve(__dirname, 'editor/playtest/index.html'),
      },
    },
  },
})
