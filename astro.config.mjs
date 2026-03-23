// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Nota: @astrojs/sitemap è stato sostituito da src/pages/sitemap.xml.ts
// che genera priorità dinamiche basate sulla profondità del contenuto.

// https://astro.build/config
export default defineConfig({
  site: 'https://aitoolsreview.it',

  // ── Output: pure static site (SSG) ───────────────────────────────────────
  // All 254+ pages are pre-rendered at build time → zero server runtime,
  // minimum TTFB when served from any CDN edge node.
  output: 'static',

  integrations: [mdx(), react()],

  // ── Image optimization (Sharp) ────────────────────────────────────────────
  // Sharp is auto-detected when installed.
  // <Image> components in .astro files are automatically converted to WebP/AVIF
  // and given correct width/height to prevent CLS.
  // OG thumbnail images (/og/*.webp) use Sharp directly in their API route.
  image: {
    // Allow the build to process images from the public/ directory
    // (used by <Image> components referencing src/assets/*).
    remotePatterns: [],
  },

  // ── Vite build configuration ──────────────────────────────────────────────
  vite: {
    plugins: [tailwindcss()],

    build: {
      rollupOptions: {
        output: {
          // Separate vendor chunks so browser caches React and Orama independently
          // from page-specific code. When articles are updated, only the app chunk
          // invalidates — React/Orama remain cached across deployments.
          manualChunks(id) {
            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('/node_modules/@orama/')) {
              return 'vendor-search';
            }
          },
        },
      },
    },
  },
});
