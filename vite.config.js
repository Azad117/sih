import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Import the plugin

export default defineConfig({
    plugins: [
      react(),
      tailwindcss(), // Add the plugin here
    ],
    server: {
    // This is the proxy configuration
    proxy: {
      // Any request starting with '/api' will be proxied
      '/api': {
        // The target is your NestJS backend server
        target: 'http://localhost:3000',
        // This is important for virtual hosts
        changeOrigin: true,
      },
    },
  },
  });