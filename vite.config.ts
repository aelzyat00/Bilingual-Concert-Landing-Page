import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
<<<<<<< HEAD
=======
  base: '/Bilingual-Concert-Landing-Page/',
>>>>>>> 31b70d1c (chore: prepare gh-pages deploy (vite base + deploy scripts))
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['motion'],
          'ui-vendor': ['lucide-react', 'sonner'],
        },
      },
    },
    assetsInlineLimit: 8192,
    sourcemap: false,
    minify: 'esbuild',
  },
})
