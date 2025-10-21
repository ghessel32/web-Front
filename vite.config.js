import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api-proxy": {
        target: "https://example.com", // The external site
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""), // remove prefix
      },
    },
  },
});
