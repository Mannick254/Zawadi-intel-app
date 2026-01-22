import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A simple Vite plugin for rewriting requests.
function rewritePlugin() {
  return {
    name: 'rewrite-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/admin') {
          req.url = '/admin.html';
        } else if (req.url === '/') {
          req.url = '/index.html';
        }
        next();
      });
    }
  };
}

// Refined Vite configuration for Zawadi Intel PWA
export default defineConfig({
  plugins: [react(), rewritePlugin()],
  server: {
    port: 5173,          // Explicit dev port
    open: true,          // Auto-open browser on dev start
    host: true           // Allow LAN access for testing on other devices
  },
  build: {
    outDir: 'dist',      // Output directory for production build
    assetsDir: 'assets', // Directory for static assets
    sourcemap: true,     // Generate source maps for easier debugging
    minify: 'esbuild',   // Fast minification
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'], // Split vendor chunks for caching
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'        // Shortcut for imports (e.g., '@/components/NewsFeed')
    }
  }
});
