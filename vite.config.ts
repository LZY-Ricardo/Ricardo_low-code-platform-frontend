import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // base: '/dist/',
  server: {
    port: 3333,
    open: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('monaco-editor') || id.includes('@monaco-editor')) {
            return 'monaco'
          }

          if (id.includes('html2canvas')) {
            return 'html2canvas'
          }

          if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-') || id.includes('dayjs')) {
            return 'antd-vendor'
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor'
          }

          if (id.includes('lodash-es') || id.includes('jszip') || id.includes('file-saver') || id.includes('axios')) {
            return 'app-vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1300,
  },
})
