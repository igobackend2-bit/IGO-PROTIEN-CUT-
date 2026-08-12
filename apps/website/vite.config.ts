import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    // Static assets live in static/, NOT the Vite default public/.
    //
    // This project sits inside the IGO monorepo, whose root .gitignore
    // contains `apps/website/public/` — so anything in public/ is silently
    // never committed, and the deployed site would ship with zero images.
    // static/ is the tracked convention across the monorepo, and it's also
    // what .github/workflows/deploy.yml expects when it copies .htaccess and
    // the SEO files into dist/.
    publicDir: 'static',

    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
