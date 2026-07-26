import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  css: {
    preprocessorOptions: {
      scss: {
        // Note the new path, the 'as *', and the '\n' at the end!
        additionalData: `@use "/src/styles/variables.scss" as *;\n`,
      },
    },
  },
});