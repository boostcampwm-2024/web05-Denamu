import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src/") }],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "radix-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-tooltip",
          ],
          charts: ["recharts"],
          vendor: ["react", "react-dom", "react-router-dom"],
          animation: ["framer-motion"],
          query: ["@tanstack/react-query", "@tanstack/react-query-devtools"],
          socket: ["socket.io-client"],
          utils: ["class-variance-authority", "clsx", "tailwind-merge", "zustand"],
          "ui-utils": ["lucide-react", "avvvatars-react", "cmdk"],
        },
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
