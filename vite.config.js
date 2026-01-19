import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // The directory where the built files will be placed
    assetsDir: 'assets', // The directory for static assets
  },
});
