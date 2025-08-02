import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: './postcss.config.mjs', // Hoặc './postcss.config.cjs' nếu dùng CommonJS
  },
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ IP LAN
    port: 5173
  }
});