import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2017',
  legacyOutput: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  esbuildOptions(options) {
    options.assetNames = '[name]';
    options.define = {
      ...options.define,
      GATEWAY_FRONTEND_CANISTER_ID: `"${process.env.gateway_frontend}"`,
    };
  },
});
