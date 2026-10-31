import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cấu hình dùng cho dev và deploy lên Vercel (BrowserRouter, đường dẫn đẹp như /chon-cach-doc)
export default defineConfig({
  plugins: [react()],
  define: { __ROUTER__: JSON.stringify("browser") },
});
