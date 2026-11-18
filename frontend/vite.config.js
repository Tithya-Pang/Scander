import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Must match PORT in backend/.env (5050 by default, see backend/.env.example).
// Run with API_PORT=5000 npm run dev if your backend uses a different port.
const apiPort = process.env.API_PORT || 5050;

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, port: 5173,
    proxy: { '/api': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: true } }
  }
});
