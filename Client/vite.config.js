import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // In LOCAL dev: proxies /api → Express on localhost:5001
      // In PRODUCTION (Vercel): VITE_API_URL is set, so fetch() goes directly
      // to the Render URL — proxy is only active during `npm run dev`
      "/api": {
        target:      "http://localhost:5001",
        changeOrigin: true,
        secure:       false,
      },
    },
  },
  build: {
    outDir:        "dist",
    sourcemap:     false,
    rollupOptions: {
      output: {
        // Split vendor chunks for faster loads
        manualChunks: {
          vendor:  ["react", "react-dom", "react-router-dom"],
          charts:  ["chart.js", "react-chartjs-2"],
        },
      },
    },
  },
});
