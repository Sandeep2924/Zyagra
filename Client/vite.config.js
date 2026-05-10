import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Every request to /api/... is forwarded to the Express server.
      // This means the frontend NEVER has to hardcode localhost:5001 —
      // it just uses /api/... and Vite forwards it automatically.
      // This also eliminates ALL CORS errors in development.
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
