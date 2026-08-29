import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // Ejemplo:
      // "/api": {
      //   target: "http://localhost:8000",
      //   changeOrigin: true,
      // },
    },
    // allowedHosts: [
    //   "https://extensions-activation-bathroom-shop.trycloudflare.com",
    // ],
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
