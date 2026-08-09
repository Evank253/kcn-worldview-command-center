import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  base: './',
  plugins: [cesium()],
  build: {
    rollupOptions: {
      input: {
        main: `${import.meta.dirname}/index.html`,
        cesiumDemo: `${import.meta.dirname}/cesium-demo.html`,
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4200',
        changeOrigin: true,
      },
    },
  },
})
