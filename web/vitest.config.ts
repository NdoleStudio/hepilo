import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  define: {
    'import.meta.client': true,
    'import.meta.server': false,
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    root: '.',
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '@': resolve(__dirname, 'app'),
    },
  },
})
