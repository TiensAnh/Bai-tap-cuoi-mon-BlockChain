import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình Vite với React plugin
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  }
});
