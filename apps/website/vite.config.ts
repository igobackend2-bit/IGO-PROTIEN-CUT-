import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    // Static assets are in 'static/' folder (renamed from 'public' to avoid outDir conflict)
    publicDir: 'static',
    build: {
      // Standard output — set Hostinger Output Directory to 'dist'
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
      minify: 'esbuild',
      sourcemap: false,
      target: 'esnext',
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
