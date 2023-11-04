import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    // Uncomment the following line to enable solid-devtools.
    // See https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    // devtools(),
    solidPlugin(),
  ],
  server: {
    port: 3000,
    watch: {
      ignored: ['**/dist/challenge/*.txt', '**/public/challenge/*.txt'],
    },
  },
  build: {
    target: 'esnext',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTransformMode: { web: ['/\\.[jt]sx?$/'] },
    setupFiles: ['vitest-setup.ts'],
    deps: {
      optimizer: {
        web: {
          // Fixes: `You appear to have multiple instances of Solid.`
          include: [],
        },
      },
    },
  },
});
