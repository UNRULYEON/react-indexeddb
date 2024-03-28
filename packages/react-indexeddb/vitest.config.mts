import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/testing/setupFiles.ts'],
  },
  plugins: [tsconfigPaths()],
})
