import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Chỉ dùng để xuất 1 file HTML xem thử nhanh (không dùng khi deploy Vercel)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: { __ROUTER__: JSON.stringify("memory") },
  build: { outDir: "dist-preview", rollupOptions: { output: { format: "iife" } } },
});
