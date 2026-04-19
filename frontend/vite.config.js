// frontend/vite.config.js
// Sentinel — Vite bundler configuration

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(), // Enable React Fast Refresh + JSX transform
  ],

  resolve: {
    alias: {
      // Allow absolute imports from src/
      // e.g. import { Button } from "@/components/ui/button"
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
    // Proxy /api requests to FastAPI backend during development
    // Avoids CORS issues when running frontend + backend separately
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,           // Disable sourcemaps in production build
    chunkSizeWarningLimit: 1000, // Suppress warnings for large ML-related chunks
    rollupOptions: {
      output: {
        // Split vendor libraries into separate chunks for better caching
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          charts: ["recharts"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-tabs", "lucide-react"],
        },
      },
    },
  },
});
