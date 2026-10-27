import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = `http://localhost:${process.env.PORT || 3000}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': API,
      '/descargas': API,
    },
    fs: { allow: ['..'] },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
});
