import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5174,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@core": path.resolve(__dirname, "src/core"),
      "@components": path.resolve(__dirname, "src/core/components"),
      "@hooks": path.resolve(__dirname, "src/core/hooks"),
      "@config": path.resolve(__dirname, "src/core/config"),
      "@services": path.resolve(__dirname, "src/core/services"),
      "@store": path.resolve(__dirname, "src/core/store"),
      "@types": path.resolve(__dirname, "src/core/types"),
      "@utils": path.resolve(__dirname, "src/core/utils"),
      "@auth": path.resolve(__dirname, "src/modules/auth"),
      "@survey": path.resolve(__dirname, "src/modules/survey"),
    },
  },
});
