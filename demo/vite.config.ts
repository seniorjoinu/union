/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import checker from 'vite-plugin-checker';
import copy from 'rollup-plugin-copy';
import config from './tsconfig.json';

export const getCanisterIds = (projectPath: string) => {
  const canisters = getCanisters(projectPath);
  const network = process.env.DFX_NETWORK || 'local';

  const values: Record<string, any> = {};

  for (const canister in canisters) {
    const name = canister.toUpperCase().replace(/-/g, '_');

    values[`${name}_CANISTER_ID`] = canisters[canister][network];
  }

  return values;
};

type Network = string;
type CanisterId = string;
const getCanisters = (projectPath: string): Record<Network, CanisterId>[] => {
  let localCanisters;
  let prodCanisters;

  try {
    const file = fs
      .readFileSync(path.resolve(projectPath, '.dfx', 'local', 'canister_ids.json'))
      .toString();

    localCanisters = JSON.parse(file);
  } catch (error) {
    console.warn('No local canister_ids.json found. Continuing production');
  }

  try {
    const file = fs.readFileSync(path.resolve(projectPath, 'canister_ids.json')).toString();

    prodCanisters = JSON.parse(file);
  } catch (error) {
    console.warn('No production canister_ids.json found. Continuing with local');
  }

  const network = process.env.DFX_NETWORK || 'local';

  console.log('NETWORK', network);

  const canisters = network === 'local' ? localCanisters : prodCanisters;

  return canisters;
};

const envs = {
  ...getCanisterIds(__dirname),
  ...getCanisterIds(path.resolve('../internet-identity')),
};

export default defineConfig({
  server: {
    port: 3001,
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
      targets: [{ src: './src/assets/*.html', dest: 'dist' }],
      hook: 'writeBundle',
    }),
  ],
  define: {
    'process.env': {
      ...process.env,
      ...envs,
    },
    global: 'window',
  },
  build: {
    minify: true,
    chunkSizeWarningLimit: 200,
    commonjsOptions: {
      include: [],
    },
  },
});
