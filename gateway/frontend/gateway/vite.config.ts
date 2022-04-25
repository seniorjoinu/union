/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import checker from 'vite-plugin-checker';
import copy from 'rollup-plugin-copy';
import { getCanisterIds, defaultManualChunks } from './src/lib/build';
import config from './tsconfig.json';

const envs = {
  ...getCanisterIds(__dirname),
  ...getCanisterIds(path.resolve('../../backend')),
  ...getCanisterIds(path.resolve('../../../deployer-backend/canister')),
  ...getCanisterIds(path.resolve('../internet-identity')),
  MANAGEMENT_CANISTER_ID: 'aaaaa-aa',
};

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  publicDir: './public',
  resolve: {
    alias: Object.entries(config.compilerOptions.paths).reduce(
      (acc, [k, v]) => ({
        ...acc,
        [k]: path.resolve(__dirname, v[0]),
      }),
      {} as Record<string, string>,
    ),
  },
  plugins: [
    checker({ typescript: true }),
    reactRefresh(),
    copy({
      targets: [
        { src: './src/assets/*.wasm', dest: 'dist/assets' },
        { src: './src/assets/*.html', dest: 'dist' },
      ],
      hook: 'writeBundle',
    }),
  ],
  define: {
    'process.env': {
      ...process.env,
      ...envs,
    },
    global: 'window', // that is fix for packages that support both node and browser
  },
  build: {
    minify: false, // FIXME для прода нужен minify: true
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        manualChunks: (path) => defaultManualChunks(path, __dirname),
      },
    },
    commonjsOptions: {
      include: [],
    },
  },
});
