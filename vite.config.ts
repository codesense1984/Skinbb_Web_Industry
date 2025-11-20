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
    chunkSizeWarningLimit: 2000,
    target: "esnext",
    // Reduce memory usage during build
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Limit concurrent chunk processing
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            if (id.includes("@tanstack")) {
              return "vendor-query";
            }
            return "vendor";
          }
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
