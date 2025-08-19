import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-index-as-404',
      writeBundle() {
        // Copy index.html as 404.html for path support (/callback routes)
        try {
          copyFileSync(resolve(__dirname, 'dist/index.html'), resolve(__dirname, 'dist/404.html'));
        } catch (error) {
          console.warn('Could not copy index.html as 404.html:', error);
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 12345,
    host: true,
  },
  preview: {
    port: 12345,
    host: true,
  },
});
