import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/ai-career-map-test/",
  plugins: [react()],
  build: { rollupOptions: { input: { main: resolve(import.meta.dirname, "index.html"), admin: resolve(import.meta.dirname, "admin/index.html") } } },
});
