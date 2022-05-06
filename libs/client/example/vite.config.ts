import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  server: {
    port: 3002,
    strictPort: true,
  },
  envDir: '../',
  plugins: [checker({ typescript: true })],
  define: {
    GATEWAY_FRONTEND_CANISTER_ID: `"${process.env.gateway_frontend}"`,
  },
});
