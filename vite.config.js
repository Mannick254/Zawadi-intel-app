import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optional: simple rewrite plugin for dev server
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

export default defineConfig({
  plugins: [react(), rewritePlugin()],
  server: {
    port: 5173,   // Dev server port
    open: true,   // Auto-open browser
    host: true    // LAN access for testing
  },
  build: {
    outDir: 'dist',      // Production output
    assetsDir: 'assets', // Static assets folder
    sourcemap: true,     // Easier debugging
    minify: 'esbuild',   // Fast minification
    rollupOptions: {
      // ✅ Only include admin.html if it exists
      input: {
        main: 'index.html'
        // admin: 'admin.html' // Uncomment if you actually create admin.html
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'] // Vendor chunk splitting
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src' // Shortcut for imports
    }
  }
});
