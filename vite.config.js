import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 메인 프로젝트(skala-vue, 5173)와 동시에 띄울 수 있도록 5174 포트 사용
export default defineConfig({
  // GitHub Pages 프로젝트 사이트 경로
  base: '/0803_skala_vue/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
  },
})
