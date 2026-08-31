import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

const isDevelopment = process.env.NODE_ENV === 'development';
const backendHost = String(process.env.VITE_BACKEND_HOST ?? 'http://localhost');
const isLiveServer = isDevelopment && !backendHost.includes('localhost') && !backendHost.includes('127.0.0.1');

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: isLiveServer ? '0.0.0.0' : true,
    port: 3002,
  },
  plugins: [react(), tsconfigPaths()],
});
